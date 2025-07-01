import os
import json
import sys
from pathlib import Path
import re

class ContentScriptValidator:
    def __init__(self, extension_dir):
        self.extension_dir = Path(extension_dir)
        self.issues = []
        self.warnings = []
        self.passed = []
        
    def validate(self):
        """Run all content script validation checks"""
        print(f"🔍 Validating Chrome extension content script in {self.extension_dir}")
        
        # Check content script
        self.validate_content_script()
        
        # Print results
        self.print_results()
        
        # Return success status
        return len(self.issues) == 0
        
    def validate_content_script(self):
        """Validate the content.js file"""
        content_path = self.extension_dir / "content.js"
        
        if not content_path.exists():
            self.issues.append("❌ content.js is missing")
            return
            
        try:
            with open(content_path, 'r') as f:
                js_content = f.read()
                
            # Check for core functionality
            core_features = [
                ('Recording functionality', r'record(ing|Action|er)'),
                ('Replay functionality', r'replay(ing|Action|er)'),
                ('Event listeners', r'addEventListener'),
                ('DOM manipulation', r'querySelector|getElementById'),
                ('Message handling', r'onMessage|sendMessage'),
                ('Error handling', r'try\s*{|catch\s*\(')
            ]
            
            for name, pattern in core_features:
                if re.search(pattern, js_content, re.IGNORECASE):
                    self.passed.append(f"✅ content.js includes {name}")
                else:
                    self.issues.append(f"❌ content.js missing {name}")
                    
            # Check for specific recording features
            recording_features = [
                ('Click recording', r'click'),
                ('Input recording', r'input'),
                ('Keypress recording', r'keypress|keydown'),
                ('Navigation recording', r'navigation|location')
            ]
            
            for name, pattern in recording_features:
                if re.search(pattern, js_content, re.IGNORECASE):
                    self.passed.append(f"✅ content.js includes {name}")
                else:
                    self.warnings.append(f"⚠️ content.js might be missing {name}")
                    
            # Check for specific replay features
            replay_features = [
                ('Action execution', r'execute(Action|Click|Input)'),
                ('Human-like delays', r'delay|sleep|timeout|wait'),
                ('Error recovery', r'retry|recover|fallback'),
                ('Captcha detection', r'captcha')
            ]
            
            for name, pattern in replay_features:
                if re.search(pattern, js_content, re.IGNORECASE):
                    self.passed.append(f"✅ content.js includes {name}")
                else:
                    self.warnings.append(f"⚠️ content.js might be missing {name}")
                    
            # Check for platform detection
            if re.search(r'taleo|workday|successfactors|greenhouse', js_content, re.IGNORECASE):
                self.passed.append("✅ content.js includes job platform detection")
            else:
                self.warnings.append("⚠️ content.js might be missing job platform detection")
                
            # Store content for other checks
            self.content_js = js_content
                
        except Exception as e:
            self.issues.append(f"❌ Error reading content.js: {str(e)}")
            
    def print_results(self):
        """Print validation results"""
        print("\n📋 CONTENT SCRIPT VALIDATION RESULTS:")
        
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
            print("\n🎉 CONTENT SCRIPT VALIDATION SUCCESSFUL: No critical issues found!")
        else:
            print(f"\n⚠️ CONTENT SCRIPT VALIDATION FAILED: {len(self.issues)} issues need to be fixed")

def main():
    # Get extension directory from command line or use default
    extension_dir = sys.argv[1] if len(sys.argv) > 1 else "/app/dist"
    
    # Run validation
    validator = ContentScriptValidator(extension_dir)
    success = validator.validate()
    
    # Return appropriate exit code
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())