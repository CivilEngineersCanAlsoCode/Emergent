import os
import json
import sys
from pathlib import Path

class ChromeExtensionValidator:
    def __init__(self, extension_dir):
        self.extension_dir = Path(extension_dir)
        self.issues = []
        self.warnings = []
        self.passed = []
        
    def validate(self):
        """Run all validation checks"""
        print(f"🔍 Validating Chrome extension in {self.extension_dir}")
        
        # Check manifest
        self.validate_manifest()
        
        # Check required files
        self.validate_required_files()
        
        # Check permissions
        self.validate_permissions()
        
        # Check content scripts
        self.validate_content_scripts()
        
        # Check icons
        self.validate_icons()
        
        # Print results
        self.print_results()
        
        # Return success status
        return len(self.issues) == 0
        
    def validate_manifest(self):
        """Validate the manifest.json file"""
        manifest_path = self.extension_dir / "manifest.json"
        
        if not manifest_path.exists():
            self.issues.append("❌ manifest.json is missing")
            return
            
        try:
            with open(manifest_path, 'r') as f:
                manifest = json.load(f)
                
            # Check manifest version
            if manifest.get('manifest_version') != 3:
                self.issues.append(f"❌ Manifest version should be 3, found {manifest.get('manifest_version')}")
            else:
                self.passed.append("✅ Manifest version is 3 (current)")
                
            # Check required fields
            for field in ['name', 'version', 'description']:
                if field not in manifest:
                    self.issues.append(f"❌ Missing required field '{field}' in manifest")
                else:
                    self.passed.append(f"✅ Manifest contains required field '{field}'")
                    
            # Check background script
            if 'background' not in manifest:
                self.issues.append("❌ Missing background configuration in manifest")
            elif 'service_worker' not in manifest['background']:
                self.issues.append("❌ Background should use service_worker for Manifest V3")
            else:
                self.passed.append("✅ Background uses service_worker (correct for Manifest V3)")
                
            # Store manifest for other checks
            self.manifest = manifest
                
        except json.JSONDecodeError:
            self.issues.append("❌ manifest.json is not valid JSON")
        except Exception as e:
            self.issues.append(f"❌ Error reading manifest.json: {str(e)}")
            
    def validate_required_files(self):
        """Check if all required files exist"""
        required_files = [
            "manifest.json",
            "background.js",
            "popup.html",
            "popup.js"
        ]
        
        for file in required_files:
            if (self.extension_dir / file).exists():
                self.passed.append(f"✅ Required file {file} exists")
            else:
                self.issues.append(f"❌ Required file {file} is missing")
                
        # Check content script if defined in manifest
        if hasattr(self, 'manifest') and 'content_scripts' in self.manifest:
            for content_script in self.manifest['content_scripts']:
                if 'js' in content_script:
                    for js_file in content_script['js']:
                        if (self.extension_dir / js_file).exists():
                            self.passed.append(f"✅ Content script {js_file} exists")
                        else:
                            self.issues.append(f"❌ Content script {js_file} is missing")
                            
    def validate_permissions(self):
        """Check permissions in manifest"""
        if not hasattr(self, 'manifest'):
            return
            
        # Check permissions
        permissions = self.manifest.get('permissions', [])
        host_permissions = self.manifest.get('host_permissions', [])
        
        # Check for overly broad permissions
        if '<all_urls>' in host_permissions:
            self.warnings.append("⚠️ Extension requests access to all URLs")
            
        # Check for sensitive permissions
        sensitive_permissions = ['tabs', 'cookies', 'webNavigation', 'webRequest']
        for perm in sensitive_permissions:
            if perm in permissions:
                self.warnings.append(f"⚠️ Extension uses sensitive permission: {perm}")
                
        # Check if permissions match functionality
        if 'notifications' in permissions:
            self.passed.append("✅ Notifications permission present for notification functionality")
        
        if 'storage' in permissions:
            self.passed.append("✅ Storage permission present for data storage functionality")
            
    def validate_content_scripts(self):
        """Validate content scripts configuration"""
        if not hasattr(self, 'manifest') or 'content_scripts' not in self.manifest:
            self.warnings.append("⚠️ No content scripts defined in manifest")
            return
            
        content_scripts = self.manifest['content_scripts']
        
        for i, script in enumerate(content_scripts):
            # Check if matches are defined
            if 'matches' not in script:
                self.issues.append(f"❌ Content script #{i+1} missing 'matches' property")
            elif not script['matches']:
                self.issues.append(f"❌ Content script #{i+1} has empty 'matches' array")
            else:
                self.passed.append(f"✅ Content script #{i+1} has valid matches")
                
            # Check if JS files are defined
            if 'js' not in script or not script['js']:
                self.issues.append(f"❌ Content script #{i+1} missing 'js' property or has empty array")
            else:
                self.passed.append(f"✅ Content script #{i+1} has JS files defined")
                
    def validate_icons(self):
        """Validate icon files"""
        if not hasattr(self, 'manifest'):
            return
            
        icons = self.manifest.get('icons', {})
        
        if not icons:
            self.warnings.append("⚠️ No icons defined in manifest")
            return
            
        for size, path in icons.items():
            icon_path = self.extension_dir / path
            if icon_path.exists():
                # Check file size to ensure it's not a placeholder
                if icon_path.stat().st_size < 100:
                    self.warnings.append(f"⚠️ Icon {path} is very small ({icon_path.stat().st_size} bytes), might be a placeholder")
                else:
                    self.passed.append(f"✅ Icon {path} exists")
            else:
                self.issues.append(f"❌ Icon {path} is missing")
                
    def print_results(self):
        """Print validation results"""
        print("\n📋 VALIDATION RESULTS:")
        
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
            print("\n🎉 VALIDATION SUCCESSFUL: No critical issues found!")
        else:
            print(f"\n⚠️ VALIDATION FAILED: {len(self.issues)} issues need to be fixed")

def main():
    # Get extension directory from command line or use default
    extension_dir = sys.argv[1] if len(sys.argv) > 1 else "/app/dist"
    
    # Run validation
    validator = ChromeExtensionValidator(extension_dir)
    success = validator.validate()
    
    # Return appropriate exit code
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())