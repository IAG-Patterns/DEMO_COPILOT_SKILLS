#!/bin/bash
# merge_vulnerabilities.sh
# Merges multiple vulnerability reports and filters by severity
#
# Usage: ./merge_vulnerabilities.sh <min_severity> <output_file> <input_files...>
# Example: ./merge_vulnerabilities.sh high merged.json npm.json snyk.json trivy.json

set -e

MIN_SEVERITY="$1"
OUTPUT_FILE="$2"
shift 2
INPUT_FILES="$@"

if [ -z "$MIN_SEVERITY" ] || [ -z "$OUTPUT_FILE" ] || [ -z "$INPUT_FILES" ]; then
    echo "Usage: $0 <min_severity> <output_file> <input_files...>"
    echo ""
    echo "Severity levels (in order):"
    echo "  critical - Only critical"
    echo "  high     - Critical and high"
    echo "  medium   - Critical, high, and medium"
    echo "  low      - All severities"
    echo ""
    echo "Example: $0 high merged.json npm_vulns.json snyk_vulns.json"
    exit 1
fi

# Define severity filter based on minimum level
case "$MIN_SEVERITY" in
    critical)
        SEVERITY_FILTER='["critical"]'
        ;;
    high)
        SEVERITY_FILTER='["critical", "high"]'
        ;;
    medium)
        SEVERITY_FILTER='["critical", "high", "medium"]'
        ;;
    low)
        SEVERITY_FILTER='["critical", "high", "medium", "low"]'
        ;;
    *)
        echo "Error: Invalid severity level: $MIN_SEVERITY"
        echo "Valid levels: critical, high, medium, low"
        exit 1
        ;;
esac

echo "Merging vulnerability reports..."
echo "  Minimum severity: $MIN_SEVERITY"
echo "  Output file: $OUTPUT_FILE"
echo "  Input files: $INPUT_FILES"

# Check that all input files exist
for file in $INPUT_FILES; do
    if [ ! -f "$file" ]; then
        echo "Warning: Input file not found: $file (skipping)"
    fi
done

# Merge all vulnerability files
jq -s --argjson severities "$SEVERITY_FILTER" '
{
    scan_date: (now | strftime("%Y-%m-%dT%H:%M:%SZ")),
    minimum_severity: ($severities | first),
    scan_tools: [.[].scan_tool] | unique,
    vulnerabilities: [
        .[].vulnerabilities[]?
        | select(.severity as $s | $severities | index($s))
    ] | unique_by(.id + .package),
    summary: {
        total: ([.[].vulnerabilities[]? | select(.severity as $s | $severities | index($s))] | unique_by(.id + .package) | length),
        by_severity: {
            critical: ([.[].vulnerabilities[]? | select(.severity == "critical")] | unique_by(.id + .package) | length),
            high: ([.[].vulnerabilities[]? | select(.severity == "high")] | unique_by(.id + .package) | length),
            medium: ([.[].vulnerabilities[]? | select(.severity == "medium")] | unique_by(.id + .package) | length),
            low: ([.[].vulnerabilities[]? | select(.severity == "low")] | unique_by(.id + .package) | length)
        },
        by_tool: (
            group_by(.scan_tool) | map({
                tool: .[0].scan_tool,
                count: ([.[].vulnerabilities[]?] | length)
            })
        )
    }
}
' $INPUT_FILES > "$OUTPUT_FILE" 2>/dev/null || {
    echo '{"vulnerabilities":[], "summary": {"total": 0}}' > "$OUTPUT_FILE"
    echo "Warning: Could not merge files, created empty report"
}

# Display summary
TOTAL=$(jq '.summary.total' "$OUTPUT_FILE")
CRITICAL=$(jq '.summary.by_severity.critical' "$OUTPUT_FILE")
HIGH=$(jq '.summary.by_severity.high' "$OUTPUT_FILE")
MEDIUM=$(jq '.summary.by_severity.medium' "$OUTPUT_FILE")
LOW=$(jq '.summary.by_severity.low' "$OUTPUT_FILE")

echo ""
echo "Merged Vulnerability Report:"
echo "============================"
echo "  Total (filtered): $TOTAL"
echo "    Critical: $CRITICAL"
echo "    High: $HIGH"
echo "    Medium: $MEDIUM"
echo "    Low: $LOW"
echo ""
echo "Output: $OUTPUT_FILE"
