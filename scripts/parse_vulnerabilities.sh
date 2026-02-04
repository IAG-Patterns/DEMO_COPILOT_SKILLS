#!/bin/bash
# parse_vulnerabilities.sh
# Parses security scan output and creates vulnerability_report.json for Claude Code Agent
#
# Usage: ./parse_vulnerabilities.sh <scan_tool> <input_file> [output_file]
# Supported tools: npm-audit, snyk, trivy, pip-audit, codeql
# Requires: jq installed

set -e

SCAN_TOOL="$1"
INPUT_FILE="$2"
OUTPUT_FILE="${3:-vulnerability_report.json}"

if [ -z "$SCAN_TOOL" ] || [ -z "$INPUT_FILE" ]; then
    echo "Usage: $0 <scan_tool> <input_file> [output_file]"
    echo ""
    echo "Supported scan tools:"
    echo "  npm-audit  - npm audit --json output"
    echo "  snyk       - snyk test --json output"
    echo "  trivy      - trivy fs --format json output"
    echo "  pip-audit  - pip-audit --format json output"
    echo "  codeql     - CodeQL SARIF output"
    echo ""
    echo "Example: $0 npm-audit npm_audit.json vulnerability_report.json"
    exit 1
fi

if [ ! -f "$INPUT_FILE" ]; then
    echo "Error: Input file not found: $INPUT_FILE"
    exit 1
fi

echo "Parsing $SCAN_TOOL output from $INPUT_FILE..."

case "$SCAN_TOOL" in
    npm-audit)
        jq '{
            scan_tool: "npm-audit",
            scan_date: (now | strftime("%Y-%m-%dT%H:%M:%SZ")),
            vulnerabilities: [
                .vulnerabilities | to_entries[]? | .value | {
                    id: (.via[0].source // .name // "unknown"),
                    severity: .severity,
                    package: .name,
                    current_version: .range,
                    fixed_version: (.fixAvailable.version // "unknown"),
                    file: "package.json",
                    description: (.via[0].title // "No description available"),
                    recommendation: ("Upgrade to " + (.fixAvailable.version // "latest version"))
                }
            ]
        }' "$INPUT_FILE" > "$OUTPUT_FILE"
        ;;
    
    snyk)
        jq '{
            scan_tool: "snyk",
            scan_date: (now | strftime("%Y-%m-%dT%H:%M:%SZ")),
            vulnerabilities: [
                .vulnerabilities[]? | {
                    id: .id,
                    severity: .severity,
                    package: .packageName,
                    current_version: .version,
                    fixed_version: (.fixedIn[0] // "unknown"),
                    file: (.from[0] // "package.json"),
                    description: .title,
                    recommendation: (.remediation // "Upgrade to fixed version"),
                    cve: (.identifiers.CVE[0] // null),
                    cwe: (.identifiers.CWE[0] // null)
                }
            ]
        }' "$INPUT_FILE" > "$OUTPUT_FILE"
        ;;
    
    trivy)
        jq '{
            scan_tool: "trivy",
            scan_date: (now | strftime("%Y-%m-%dT%H:%M:%SZ")),
            vulnerabilities: [
                .Results[]?.Vulnerabilities[]? | {
                    id: .VulnerabilityID,
                    severity: (.Severity | ascii_downcase),
                    package: .PkgName,
                    current_version: .InstalledVersion,
                    fixed_version: (.FixedVersion // "unknown"),
                    file: "filesystem",
                    description: .Title,
                    recommendation: ("Upgrade to " + (.FixedVersion // "latest version")),
                    cve: .VulnerabilityID,
                    references: .References
                }
            ]
        }' "$INPUT_FILE" > "$OUTPUT_FILE"
        ;;
    
    pip-audit)
        jq '{
            scan_tool: "pip-audit",
            scan_date: (now | strftime("%Y-%m-%dT%H:%M:%SZ")),
            vulnerabilities: [
                .[]? | {
                    id: .id,
                    severity: "high",
                    package: .name,
                    current_version: .version,
                    fixed_version: (.fix_versions[0] // "unknown"),
                    file: "requirements.txt",
                    description: .description,
                    recommendation: ("Upgrade to " + (.fix_versions[0] // "latest version")),
                    aliases: .aliases
                }
            ]
        }' "$INPUT_FILE" > "$OUTPUT_FILE"
        ;;
    
    codeql)
        # Parse SARIF format from CodeQL
        jq '{
            scan_tool: "codeql",
            scan_date: (now | strftime("%Y-%m-%dT%H:%M:%SZ")),
            vulnerabilities: [
                .runs[0].results[]? | {
                    id: .ruleId,
                    severity: (
                        if .level == "error" then "high"
                        elif .level == "warning" then "medium"
                        else "low"
                        end
                    ),
                    package: "source-code",
                    current_version: "N/A",
                    fixed_version: "N/A",
                    file: .locations[0].physicalLocation.artifactLocation.uri,
                    line: .locations[0].physicalLocation.region.startLine,
                    description: .message.text,
                    recommendation: (.rule.help.text // "See CodeQL documentation"),
                    rule_name: .rule.name
                }
            ]
        }' "$INPUT_FILE" > "$OUTPUT_FILE"
        ;;
    
    *)
        echo "Error: Unknown scan tool: $SCAN_TOOL"
        echo "Supported: npm-audit, snyk, trivy, pip-audit, codeql"
        exit 1
        ;;
esac

# Add summary statistics
VULN_COUNT=$(jq '.vulnerabilities | length' "$OUTPUT_FILE")
CRITICAL=$(jq '[.vulnerabilities[] | select(.severity == "critical")] | length' "$OUTPUT_FILE")
HIGH=$(jq '[.vulnerabilities[] | select(.severity == "high")] | length' "$OUTPUT_FILE")
MEDIUM=$(jq '[.vulnerabilities[] | select(.severity == "medium")] | length' "$OUTPUT_FILE")
LOW=$(jq '[.vulnerabilities[] | select(.severity == "low")] | length' "$OUTPUT_FILE")

# Update the output with summary
jq --argjson total "$VULN_COUNT" \
   --argjson critical "$CRITICAL" \
   --argjson high "$HIGH" \
   --argjson medium "$MEDIUM" \
   --argjson low "$LOW" \
   '. + {
        summary: {
            total: $total,
            by_severity: {
                critical: $critical,
                high: $high,
                medium: $medium,
                low: $low
            }
        }
    }' "$OUTPUT_FILE" > "${OUTPUT_FILE}.tmp" && mv "${OUTPUT_FILE}.tmp" "$OUTPUT_FILE"

echo ""
echo "Vulnerability Report Summary:"
echo "============================="
echo "  Scan tool: $SCAN_TOOL"
echo "  Total vulnerabilities: $VULN_COUNT"
echo "    Critical: $CRITICAL"
echo "    High: $HIGH"
echo "    Medium: $MEDIUM"
echo "    Low: $LOW"
echo ""
echo "Output: $OUTPUT_FILE"
