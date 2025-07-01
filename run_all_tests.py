import os
import sys
import subprocess
from pathlib import Path
import json
import datetime

class ExtensionTestReport:
    def __init__(self, extension_dir):
        self.extension_dir = Path(extension_dir)
        self.report_data = {
            "timestamp": datetime.datetime.now().isoformat(),
            "extension_name": "AutoApply",
            "extension_dir": str(extension_dir),
            "tests": [],
            "summary": {
                "total_tests": 0,
                "passed_tests": 0,
                "warnings": 0,
                "issues": 0
            },
            "overall_status": "PENDING"
        }
        
    def run_all_tests(self):
        """Run all test scripts and collect results"""
        print("🔍 Running comprehensive test suite for Chrome extension")
        
        # List of test scripts to run
        test_scripts = [
            ("/app/extension_test.py", "Manifest and Structure Validation"),
            ("/app/ui_test.py", "UI Component Validation"),
            ("/app/content_test.py", "Content Script Validation"),
            ("/app/background_test.py", "Background Script Validation")
        ]
        
        # Run each test and collect results
        for script_path, test_name in test_scripts:
            print(f"\n📋 Running {test_name}...")
            result = self.run_test_script(script_path)
            self.report_data["tests"].append({
                "name": test_name,
                "script": script_path,
                "passed": result["passed"],
                "warnings": result["warnings"],
                "issues": result["issues"],
                "status": "PASS" if result["status"] == 0 else "FAIL",
                "output": result["output"]
            })
            
            # Update summary
            self.report_data["summary"]["total_tests"] += 1
            if result["status"] == 0:
                self.report_data["summary"]["passed_tests"] += 1
            self.report_data["summary"]["warnings"] += len(result["warnings"])
            self.report_data["summary"]["issues"] += len(result["issues"])
            
        # Set overall status
        if self.report_data["summary"]["passed_tests"] == self.report_data["summary"]["total_tests"]:
            self.report_data["overall_status"] = "PASS"
        else:
            self.report_data["overall_status"] = "FAIL"
            
        # Generate report
        self.generate_report()
        
    def run_test_script(self, script_path):
        """Run a single test script and parse its output"""
        try:
            # Run the script and capture output
            result = subprocess.run(
                [sys.executable, script_path, str(self.extension_dir)],
                capture_output=True,
                text=True
            )
            
            # Parse output for passed checks, warnings, and issues
            output = result.stdout
            passed = []
            warnings = []
            issues = []
            
            for line in output.split('\n'):
                if line.strip().startswith("✅"):
                    passed.append(line.strip())
                elif line.strip().startswith("⚠️"):
                    warnings.append(line.strip())
                elif line.strip().startswith("❌"):
                    issues.append(line.strip())
                    
            return {
                "status": result.returncode,
                "output": output,
                "passed": passed,
                "warnings": warnings,
                "issues": issues
            }
            
        except Exception as e:
            return {
                "status": 1,
                "output": f"Error running test: {str(e)}",
                "passed": [],
                "warnings": [],
                "issues": [f"❌ Failed to run test: {str(e)}"]
            }
            
    def generate_report(self):
        """Generate a human-readable report"""
        report_path = Path("/app/extension_test_report.md")
        
        with open(report_path, 'w') as f:
            f.write(f"# 🔍 AutoApply Chrome Extension Test Report\n\n")
            f.write(f"**Generated:** {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
            
            # Overall status
            status_emoji = "✅" if self.report_data["overall_status"] == "PASS" else "❌"
            f.write(f"## {status_emoji} Overall Status: {self.report_data['overall_status']}\n\n")
            
            # Summary
            summary = self.report_data["summary"]
            f.write("## 📊 Summary\n\n")
            f.write(f"- **Total Tests:** {summary['total_tests']}\n")
            f.write(f"- **Passed Tests:** {summary['passed_tests']}\n")
            f.write(f"- **Warnings:** {summary['warnings']}\n")
            f.write(f"- **Issues:** {summary['issues']}\n\n")
            
            # Individual test results
            f.write("## 📋 Test Results\n\n")
            
            for test in self.report_data["tests"]:
                status_emoji = "✅" if test["status"] == "PASS" else "❌"
                f.write(f"### {status_emoji} {test['name']}\n\n")
                f.write(f"**Status:** {test['status']}\n\n")
                
                if test["passed"]:
                    f.write("#### Passed Checks\n\n")
                    for item in test["passed"]:
                        f.write(f"- {item}\n")
                    f.write("\n")
                    
                if test["warnings"]:
                    f.write("#### Warnings\n\n")
                    for item in test["warnings"]:
                        f.write(f"- {item}\n")
                    f.write("\n")
                    
                if test["issues"]:
                    f.write("#### Issues\n\n")
                    for item in test["issues"]:
                        f.write(f"- {item}\n")
                    f.write("\n")
                    
            # Recommendations
            f.write("## 🚀 Recommendations\n\n")
            
            if summary["issues"] > 0:
                f.write("### Critical Issues to Fix\n\n")
                for test in self.report_data["tests"]:
                    for issue in test["issues"]:
                        f.write(f"- **{test['name']}:** {issue}\n")
                f.write("\n")
                
            if summary["warnings"] > 0:
                f.write("### Improvements to Consider\n\n")
                for test in self.report_data["tests"]:
                    for warning in test["warnings"]:
                        f.write(f"- **{test['name']}:** {warning}\n")
                f.write("\n")
                
            # Final assessment
            f.write("## 🏁 Final Assessment\n\n")
            
            if self.report_data["overall_status"] == "PASS":
                f.write("✅ **The extension passes all critical validation checks and appears ready for installation.**\n\n")
                
                if summary["warnings"] > 0:
                    f.write("⚠️ While there are some warnings, they do not prevent the extension from functioning correctly.\n")
                    f.write("Consider addressing these warnings in future updates to improve the extension.\n\n")
                else:
                    f.write("🎉 No warnings or issues detected! The extension is in excellent condition.\n\n")
            else:
                f.write("❌ **The extension has critical issues that should be addressed before installation.**\n\n")
                f.write("Please fix the issues listed above to ensure proper functionality.\n\n")
                
            print(f"📝 Report generated at {report_path}")
            
        # Also save JSON data for programmatic use
        json_path = Path("/app/extension_test_report.json")
        with open(json_path, 'w') as f:
            json.dump(self.report_data, f, indent=2)
            
        return report_path

def main():
    # Get extension directory from command line or use default
    extension_dir = sys.argv[1] if len(sys.argv) > 1 else "/app/dist"
    
    # Run tests and generate report
    reporter = ExtensionTestReport(extension_dir)
    reporter.run_all_tests()
    
    # Return appropriate exit code
    return 0 if reporter.report_data["overall_status"] == "PASS" else 1

if __name__ == "__main__":
    sys.exit(main())