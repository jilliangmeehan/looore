```dataview
TABLE file.mday AS "Recently updated"
FROM "content"
WHERE file.mday.monthyear = this.file.mday.monthyear AND file.name != "index"
SORT file.mday DESC
```
