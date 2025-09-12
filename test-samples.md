# Test Samples for summarizeFile

---

## Sample 1

**Input (diff):**
```diff
diff --git a/.github/workflows/jira-summary.yml b/.github/workflows/jira-summary.yml
index 57ffcfa..75c558c 100644
--- a/.github/workflows/jira-summary.yml
+++ b/.github/workflows/jira-summary.yml
@@ -19,8 +19,12 @@
         with:
           node-version: '20'
       
+      - name: Install dependencies
+        run: |
+          npm install --save-dev @types/node tsx
+      
       - name: Parse commits and generate data
         run: |
-          node .github/scripts/parse-commits.js
+          npx tsx .github/scripts/parse-commits.ts
         env:
           GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
\ No newline at end of file
```

**Prompt:**
Generate a pull request summary from the following diff. Format the response in markdown with these sections:
    * **Summary**: A high-level overview of the changes.
    * **Files Changed**: A one-sentence summary for each modified file.
    * **Testing**: Details on how the changes were verified.
    * **Related Issues**: (Optional) List any related issue numbers (e.g., "Closes #123").
Diff: ${fileContent}

**Expected Output:**
**Summary**
This pull request updates the `jira-summary.yml` GitHub Actions workflow to execute a TypeScript script instead of a JavaScript script. It introduces a new step to install `tsx` and `@types/node` as dev dependencies, enabling the direct execution of `.ts` files within the workflow.

**Files Changed**
*   `.github/workflows/jira-summary.yml`: Modified the workflow to add an `npm install` step for TypeScript dependencies (`@types/node`, `tsx`) and updated the `Parse commits and generate data` step to execute `.github/scripts/parse-commits.ts` using `npx tsx`.

**Testing**
The changes were verified by:
*   Running the GitHub Actions workflow manually to ensure all steps, including dependency installation and TypeScript script execution, complete successfully.
*   Confirming that the `Parse commits and generate data` step correctly processes commits and generates the expected output after the change to `tsx`.

**Related Issues**
N/A

---

## Sample 2

**Input (diff):**
Same as above.

**Prompt:**  
Generate a pull request summary for the following diff. The output should contain just a concise, single-paragraph explanation of the changes. ${fileContent};

**Expected Output:**
This update migrates the Jira summary commit parsing script to TypeScript by adding `tsx` and `@types/node` as development dependencies and changing the execution command from `node .js` to `npx tsx .ts`.`

---

## Sample 3

**Input (diff):**
Same as above.

**Prompt:**  
Create a concise pull request description based on the code diff below The goal is to provide a clear and actionable summary for the reviewer.

- **Objective**: What is the single main goal of this change?
- **Affected Files**: A list of key files that were modified.
Code Diff: ${fileContent}

**Expected Output:**
**Objective:**
Enables TypeScript execution for the `parse-commits` script within the `jira-summary` workflow. This allows the script to be written and run with type safety, leveraging `tsx` for direct execution.

**Affected Files:**
*   `.github/workflows/jira-summary.yml`