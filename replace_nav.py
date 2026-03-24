import os
import glob

directory = r"c:\Users\User\Desktop\OJT-4thyear\TGGG_Accountingkimver\frontend\src\pages\dashboards\ceo"

for filepath in glob.glob(os.path.join(directory, "*.jsx")):
    if 'CeoNavigation' in filepath:
        continue
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    new_content = content.replace("import CeoNavigation from './CeoNavigation';", "import PublicNavigation from '../Public_Dashboard/PublicNavigation';")
    new_content = new_content.replace("<CeoNavigation", "<PublicNavigation")

    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated: {filepath}")
    else:
        print(f"Skipped: {filepath}")

print("Done.")
