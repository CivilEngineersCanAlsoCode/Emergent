import os
import json
import sys
from pathlib import Path
import re

class ChromeExtensionUIValidator:
    def __init__(self, extension_dir):
        self.extension_dir = Path(extension_dir)
        self.issues = []
        self.warnings = []
        self.passed = []
        
    def validate(self):
        """Run all UI validation checks"""
        print(f"🔍 Validating Chrome extension UI in {self.extension_dir}")
        
        # Check popup HTML
        self.validate_popup_html()
        
        # Check popup JS
        self.validate_popup_js()
        
        # Print results
        self.print_results()
        
        # Return success status
        return len(self.issues) == 0
        
    def validate_popup_html(self):
        """Validate the popup.html file"""
        popup_path = self.extension_dir / "popup.html"
        
        if not popup_path.exists():
            self.issues.append("❌ popup.html is missing")
            return
            
        try:
            with open(popup_path, 'r') as f:
                html_content = f.read()
                
            # Check for basic HTML structure
            if not re.search(r'<!doctype html>', html_content, re.IGNORECASE):
                self.warnings.append("⚠️ popup.html missing <!DOCTYPE html> declaration")
            else:
                self.passed.append("✅ popup.html has proper DOCTYPE declaration")
                
            # Check for required UI elements
            required_elements = [
                ('Start Recording button', r'id=["\']btn-record["\']'),
                ('Replay button', r'id=["\']btn-replay["\']'),
                ('Stop button', r'id=["\']btn-stop["\']'),
                ('Status display', r'id=["\']status-text["\']'),
                ('Progress display', r'id=["\']progress-text["\']')
            ]
            
            for name, pattern in required_elements:
                if re.search(pattern, html_content):
                    self.passed.append(f"✅ popup.html contains {name}")
                else:
                    self.issues.append(f"❌ popup.html missing {name}")
                    
            # Check for script inclusion
            if not re.search(r'<script[^>]*src=["\']popup\.js["\']', html_content):
                self.issues.append("❌ popup.html does not include popup.js script")
            else:
                self.passed.append("✅ popup.html includes popup.js script")
                
            # Store HTML content for other checks
            self.popup_html = html_content
                
        except Exception as e:
            self.issues.append(f"❌ Error reading popup.html: {str(e)}")
            
    def validate_popup_js(self):
        """Validate the popup.js file"""
        popup_js_path = self.extension_dir / "popup.js"
        
        if not popup_js_path.exists():
            self.issues.append("❌ popup.js is missing")
            return
            
        try:
            with open(popup_js_path, 'r') as f:
                js_content = f.read()
                
            # Check for event listeners
            if not re.search(r'addEventListener\(["\']click["\']', js_content):
                self.warnings.append("⚠️ popup.js might be missing click event listeners")
            else:
                self.passed.append("✅ popup.js has click event listeners")
                
            # Check for DOM manipulation
            if not re.search(r'document\.getElementById', js_content):
                self.warnings.append("⚠️ popup.js might be missing DOM element selection")
            else:
                self.passed.append("✅ popup.js selects DOM elements")
                
            # Check for Chrome API usage
            chrome_apis = [
                ('chrome.tabs API', r'chrome\.tabs'),
                ('chrome.runtime API', r'chrome\.runtime'),
                ('chrome.storage API', r'chrome\.storage')
            ]
            
            for name, pattern in chrome_apis:
                if re.search(pattern, js_content):
                    self.passed.append(f"✅ popup.js uses {name}")
                else:
                    self.warnings.append(f"⚠️ popup.js might not use {name}")
                    
            # Check for error handling
            if not re.search(r'try\s*{', js_content):
                self.warnings.append("⚠️ popup.js might lack error handling (no try-catch blocks found)")
            else:
                self.passed.append("✅ popup.js includes error handling")
                
            # Store JS content for other checks
            self.popup_js = js_content
                
        except Exception as e:
            self.issues.append(f"❌ Error reading popup.js: {str(e)}")
            
    def print_results(self):
        """Print validation results"""
        print("\n📋 UI VALIDATION RESULTS:")
        
        if self.passed:
            print("\n✅ PASSED CHECKS:")
            for item in self.passed:
                print(f"  {item}")
                
        if self.warnings:
            print("\n⚠️ WARNINGS:")
            for item in self.warnings:
                print(f"  {item}")
                
        if self.issues:
            print("\n❌ ISSUES:")
            for item in self.issues:
                print(f"  {item}")
                
        # Summary
        total_checks = len(self.passed) + len(self.warnings) + len(self.issues)
        print(f"\n📊 SUMMARY: {len(self.passed)} passed, {len(self.warnings)} warnings, {len(self.issues)} issues")
        
        if not self.issues:
            print("\n🎉 UI VALIDATION SUCCESSFUL: No critical issues found!")
        else:
            print(f"\n⚠️ UI VALIDATION FAILED: {len(self.issues)} issues need to be fixed")

def main():
    # Get extension directory from command line or use default
    extension_dir = sys.argv[1] if len(sys.argv) > 1 else "/app/dist"
    
    # Run validation
    validator = ChromeExtensionUIValidator(extension_dir)
    success = validator.validate()
    
    # Return appropriate exit code
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())