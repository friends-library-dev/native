```
editions/d9964dc1-bfcb-4bcf-b094-4051b10d251e--modernized--9e86049.html
```

API has sha of most recent commit...

When book screen loads:

- we know the `resourceId`, and we know the most recent SHA, so...
- check if we have downloaded the book at that SHA
- if no download, or sha doesn't match (IF we have an internet connection)
  - A) rimraf the book dir (might be no-op)
  - B) download the book again
- once the book is downloaded, figure out what chapter, and what position to render at
- render...

- COMBINE CHAPTERS?
- intermediate titles are sad, and very short chapters...
