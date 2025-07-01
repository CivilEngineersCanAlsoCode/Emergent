import os
import json
import sys
from pathlib import Path
import re

class BackgroundScriptValidator:
    def __init__(self, extension_dir):
        self.extension_dir = Path(extension_dir)
        self.issues = []
        self.warnings = []
        self.passed = []
        
    def validate(self):
        """Run all background script validation checks"""
        print(f"🔍 Validating Chrome extension background script in {self.extension_dir}")
        
        # Check background script
        self.validate_background_script()
        
        # Print results
        self.print_results()
        
        # Return success status
        return len(self.issues) == 0
        
    def validate_background_script(self):
        """Validate the background.js file"""
        background_path = self.extension_dir / "background.js"
        
        if not background_path.exists():
            self.issues.append("❌ background.js is missing")
            return
            
        try:
            with open(background_path, 'r') as f:
                js_content = f.read()
                
            # Check for core functionality
            core_features = [
                ('Message handling', r'onMessage|sendMessage'),
                ('Storage operations', r'storage\.local|chrome\.storage'),
                ('Error handling', r'try\s*{|catch\s*\('),
                ('Extension lifecycle', r'onInstalled|onStartup')
            ]
            
            for name, pattern in core_features:
                if re.search(pattern, js_content, re.IGNORECASE):
                    self.passed.append(f"✅ background.js includes {name}")
                else:
                    self.issues.append(f"❌ background.js missing {name}")
                    
            # Check for specific features
            features = [
                ('Notification system', r'notification|notify'),
                ('Badge management', r'setBadgeText|setBadgeBackgroundColor'),
                ('Session management', r'session'),
                ('Data persistence', r'save|store|get'),
                ('Platform detection', r'taleo|workday|successfactors|greenhouse')
            ]
            
            for name, pattern in features:
                if re.search(pattern, js_content, re.IGNORECASE):
                    self.passed.append(f"✅ background.js includes {name}")
                else:
                    self.warnings.append(f"⚠️ background.js might be missing {name}")
                    
            # Check for event listeners
            events = [
                ('Runtime message events', r'onMessage'),
                ('Tab events', r'onCreated|onRemoved|onUpdated'),
                ('Alarm events', r'onAlarm'),
                ('Storage events', r'onChanged')
            ]
            
            for name, pattern in events:
                if re.search(pattern, js_content, re.IGNORECASE):
                    self.passed.append(f"✅ background.js listens for {name}")
                else:
                    self.warnings.append(f"⚠️ background.js might not listen for {name}")
                    
            # Store content for other checks
            self.background_js = js_content
                
        except Exception as e:
            self.issues.append(f"❌ Error reading background.js: {str(e)}")
            
    def print_results(self):
        """Print validation results"""
        print("\n📋 BACKGROUND SCRIPT VALIDATION RESULTS:")
        
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
            print("\n🎉 BACKGROUND SCRIPT VALIDATION SUCCESSFUL: No critical issues found!")
        else:
            print(f"\n⚠️ BACKGROUND SCRIPT VALIDATION FAILED: {len(self.issues)} issues need to be fixed")

def main():
    # Get extension directory from command line or use default
    extension_dir = sys.argv[1] if len(sys.argv) > 1 else "/app/dist"
    
    # Run validation
    validator = BackgroundScriptValidator(extension_dir)
    success = validator.validate()
    
    # Return appropriate exit code
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())