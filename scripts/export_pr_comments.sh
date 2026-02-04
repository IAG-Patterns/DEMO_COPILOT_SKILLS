#!/bin/bash
# export_pr_comments.sh
# Exports PR comments and creates refactor_tasks.json for Claude Code Agent
# 
# Usage: ./export_pr_comments.sh <owner> <repo> <pr_number>
# Requires: gh CLI authenticated, jq installed

set -e

OWNER="$1"
REPO="$2"
PR_NUMBER="$3"

if [ -z "$OWNER" ] || [ -z "$REPO" ] || [ -z "$PR_NUMBER" ]; then
    echo "Usage: $0 <owner> <repo> <pr_number>"
    echo "Example: $0 myorg myrepo 123"
    exit 1
fi

echo "Exporting PR comments for $OWNER/$REPO#$PR_NUMBER..."

# Create output directory
OUTPUT_DIR="${OUTPUT_DIR:-.}"
mkdir -p "$OUTPUT_DIR"

# Fetch conversation comments (issue comments on PR)
echo "Fetching conversation comments..."
gh api "/repos/$OWNER/$REPO/issues/$PR_NUMBER/comments" \
    --paginate \
    --jq '[.[] | {
        id: .id,
        type: "conversation",
        author: .user.login,
        author_type: .user.type,
        created_at: .created_at,
        updated_at: .updated_at,
        body: .body,
        html_url: .html_url
    }]' > "$OUTPUT_DIR/conversation_comments.json"

CONV_COUNT=$(jq 'length' "$OUTPUT_DIR/conversation_comments.json")
echo "  Found $CONV_COUNT conversation comments"

# Fetch review comments (inline code comments)
echo "Fetching review comments..."
gh api "/repos/$OWNER/$REPO/pulls/$PR_NUMBER/comments" \
    --paginate \
    --jq '[.[] | {
        id: .id,
        type: "review",
        author: .user.login,
        author_type: .user.type,
        created_at: .created_at,
        updated_at: .updated_at,
        body: .body,
        path: .path,
        commit_id: .commit_id,
        diff_hunk: .diff_hunk,
        line: .line,
        original_line: .original_line,
        start_line: .start_line,
        side: .side,
        in_reply_to_id: .in_reply_to_id,
        html_url: .html_url
    }]' > "$OUTPUT_DIR/review_comments.json"

REVIEW_COUNT=$(jq 'length' "$OUTPUT_DIR/review_comments.json")
echo "  Found $REVIEW_COUNT review comments"

# Fetch PR reviews
echo "Fetching PR reviews..."
gh api "/repos/$OWNER/$REPO/pulls/$PR_NUMBER/reviews" \
    --paginate \
    --jq '[.[] | {
        id: .id,
        type: "review_summary",
        author: .user.login,
        author_type: .user.type,
        state: .state,
        body: .body,
        commit_id: .commit_id,
        submitted_at: .submitted_at,
        html_url: .html_url
    }]' > "$OUTPUT_DIR/reviews.json"

REVIEWS_COUNT=$(jq 'length' "$OUTPUT_DIR/reviews.json")
echo "  Found $REVIEWS_COUNT reviews"

# Get PR details
echo "Fetching PR details..."
PR_DATA=$(gh api "/repos/$OWNER/$REPO/pulls/$PR_NUMBER")
PR_TITLE=$(echo "$PR_DATA" | jq -r '.title')
PR_STATE=$(echo "$PR_DATA" | jq -r '.state')
HEAD_REF=$(echo "$PR_DATA" | jq -r '.head.ref')

# Build refactor_tasks.json from inline review comments (excluding bots)
echo "Building refactor_tasks.json..."
jq -n \
    --argjson review "$(cat "$OUTPUT_DIR/review_comments.json")" \
    '[
        $review[]
        | select(.line != null and .author_type != "Bot")
        | . as $root
        | {
            file: .path,
            line: .line,
            author: .author,
            created_at: .created_at,
            comment: .body,
            conversation: (
                [{author: .author, body: .body}] +
                ($review | map(select(.in_reply_to_id == $root.id)) | map({author, body}))
            ),
            html_url: .html_url,
            suggestion_type: "refactor",
            status: "active"
        }
    ]' > "$OUTPUT_DIR/refactor_tasks.json"

TASK_COUNT=$(jq 'length' "$OUTPUT_DIR/refactor_tasks.json")
echo "  Created $TASK_COUNT refactor tasks"

# Build full PR_conversations.json
echo "Building PR_conversations.json..."
jq -n \
    --argjson conversation "$(cat "$OUTPUT_DIR/conversation_comments.json")" \
    --argjson review "$(cat "$OUTPUT_DIR/review_comments.json")" \
    --argjson reviews "$(cat "$OUTPUT_DIR/reviews.json")" \
    --arg pr_number "$PR_NUMBER" \
    --arg owner "$OWNER" \
    --arg repo "$REPO" \
    --arg pr_title "$PR_TITLE" \
    --arg pr_state "$PR_STATE" \
    --arg head_ref "$HEAD_REF" \
    --arg exported_at "$(date -u +"%Y-%m-%dT%H:%M:%SZ")" \
    '{
        metadata: {
            pull_request: {
                number: ($pr_number | tonumber),
                owner: $owner,
                repo: $repo,
                title: $pr_title,
                state: $pr_state,
                branch: $head_ref,
                url: "https://github.com/\($owner)/\($repo)/pull/\($pr_number)"
            },
            export: {
                exported_at: $exported_at,
                total_comments: (($conversation | length) + ($review | length)),
                conversation_comments: ($conversation | length),
                review_comments: ($review | length),
                reviews: ($reviews | length),
                refactor_tasks: ([$review[] | select(.line != null and .author_type != "Bot")] | length)
            }
        },
        comments: {
            conversation: $conversation,
            reviews: $review,
            review_summaries: $reviews
        },
        statistics: {
            comments_by_author: (
                ($conversation + $review) |
                group_by(.author) |
                map({
                    author: .[0].author,
                    count: length
                })
            ),
            comments_by_file: (
                $review |
                group_by(.path) |
                map({
                    file: .[0].path,
                    count: length
                })
            )
        }
    }' > "$OUTPUT_DIR/PR_conversations.json"

echo ""
echo "Export Summary:"
echo "==============="
echo "  PR: $OWNER/$REPO#$PR_NUMBER"
echo "  Title: $PR_TITLE"
echo "  State: $PR_STATE"
echo "  Conversation comments: $CONV_COUNT"
echo "  Review comments: $REVIEW_COUNT"
echo "  Reviews: $REVIEWS_COUNT"
echo "  Refactor tasks: $TASK_COUNT"
echo ""
echo "Output files:"
echo "  $OUTPUT_DIR/PR_conversations.json"
echo "  $OUTPUT_DIR/refactor_tasks.json"
echo "  $OUTPUT_DIR/conversation_comments.json"
echo "  $OUTPUT_DIR/review_comments.json"
echo "  $OUTPUT_DIR/reviews.json"
