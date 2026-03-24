import os
import glob

directory = r"c:\Users\User\Desktop\OJT-4thyear\TGGG_Accountingkimver\frontend\src\pages\dashboards\ceo"

for filepath in glob.glob(os.path.join(directory, "*.jsx")):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    new_content = content.replace('<aside className="w-full lg:w-64 shrink-0">', '<aside className="hidden lg:block lg:w-64 shrink-0">')
    
    # Just in case there's another variation
    new_content = new_content.replace('<aside className="w-full lg:w-64 lg:shrink-0">', '<aside className="hidden lg:block lg:w-64 lg:shrink-0">')

    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated: {filepath}")
    else: pass
        
print("Done.")
