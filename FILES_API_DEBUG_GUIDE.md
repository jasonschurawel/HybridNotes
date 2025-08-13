# 🔧 Files API Debug Guide - Network Issues Resolution

## 🚨 Fixed Network Issues

### **Previous Problems:**
1. **Incorrect API Protocol** - Was using multipart form data instead of resumable upload protocol
2. **Wrong Headers** - Missing required Google Upload Protocol headers
3. **Malformed Metadata** - Using `displayName`/`mimeType` instead of `display_name`/`mime_type`
4. **Poor Error Handling** - Not handling upload session failures properly
5. **No File Cleanup** - Large files remained on Google's servers after processing

### **Fixes Implemented:**

#### **1. Proper Resumable Upload Protocol**
```typescript
// OLD (broken) - multipart form
formData.append('metadata', new Blob([...], { type: 'application/json' }));
formData.append('data', file);

// NEW (working) - resumable upload
headers: {
  'X-Goog-Upload-Protocol': 'resumable',
  'X-Goog-Upload-Command': 'start',
  'X-Goog-Upload-Header-Content-Length': file.size.toString(),
  'X-Goog-Upload-Header-Content-Type': file.type,
}
```

#### **2. Correct Metadata Format**
```typescript
// OLD (broken)
{ file: { displayName: file.name, mimeType: file.type } }

// NEW (working)
{ file: { display_name: file.name, mime_type: file.type } }
```

#### **3. Two-Step Upload Process**
```typescript
// Step 1: Start upload session (get upload URL)
// Step 2: Upload actual file data to the URL
// Step 3: Poll for processing completion
```

#### **4. Automatic File Cleanup**
Files are now automatically deleted after processing to prevent quota buildup.

## 🧪 Testing Instructions

### **Test with Browser Console Open (F12)**

#### **For Small Files (< 50MB):**
Expected console output:
```
Processing PDF: test.pdf, Size: 25.00MB
Processing file (25.0MB) via base64 upload...
Converting PDF for processing...
Sending request to Gemini API...
Received response from Gemini API
```

#### **For Large Files (> 50MB):**
Expected console output:
```
Processing PDF: large.pdf, Size: 75.00MB
Uploading large file (75.0MB) to Files API...
Upload session started, uploading file...
File uploaded successfully: files/abc123def456
File processing state: PROCESSING (attempt 1)
File processing state: PROCESSING (attempt 2)
File processing state: ACTIVE (attempt 3)
File processed and ready for use
Converting PDF for processing...
Sending request to Gemini API...
Received response from Gemini API
Cleaning up uploaded file...
File cleanup successful
```

### **Error Scenarios to Test:**

#### **1. Network Interruption**
- Start upload of large file
- Disconnect internet briefly
- Should see: retry attempts with exponential backoff

#### **2. Invalid API Key**
- Use wrong API key
- Should see: "Permission denied. Please check your API key permissions."

#### **3. File Too Large**
- Try uploading > 2GB file
- Should see: "File size (X.XGB) exceeds the 2GB limit..."

#### **4. API Quota Exceeded**
- If you hit quota limits
- Should see: "API quota exceeded. Please check your Google Cloud billing."

## 🔍 Debugging Commands

### **Check File Upload Progress:**
Open browser Developer Tools → Network tab to see:
- Upload session request to `/files?key=...`
- File upload to upload URL
- Status polling requests

### **Monitor Console Logs:**
Look for these key messages:
- ✅ "Upload session started, uploading file..."
- ✅ "File uploaded successfully: files/..."
- ✅ "File processing state: ACTIVE"
- ✅ "File cleanup successful"

### **Common Error Messages:**

#### **Upload Session Failures:**
```
"Failed to start upload: 400 Bad Request"
→ Check API key permissions for Files API

"Failed to start upload: 413 Payload Too Large"
→ File exceeds 2GB limit
```

#### **File Upload Failures:**
```
"File upload failed: 404 Not Found"
→ Upload session expired, retry

"File upload failed: 500 Internal Server Error"
→ Google server issue, retry with backoff
```

#### **Processing Failures:**
```
"File processing failed or timed out. Final state: FAILED"
→ File may be corrupted or unsupported format

"File processing failed or timed out. Final state: PROCESSING"
→ File too large or complex, try smaller file
```

## 🚀 Performance Expectations

### **Upload Times (depends on internet speed):**
- **50MB file**: 30-60 seconds upload + 30-60 seconds processing
- **100MB file**: 1-2 minutes upload + 1-2 minutes processing  
- **500MB file**: 5-10 minutes upload + 2-5 minutes processing
- **1GB+ file**: 10-20 minutes upload + 5-10 minutes processing

### **Success Indicators:**
1. Upload session starts successfully
2. File uploads without errors
3. File reaches 'ACTIVE' state
4. Gemini API processes file successfully
5. File gets cleaned up automatically

## 🆘 Troubleshooting Steps

### **If Upload Fails:**
1. Check internet connection stability
2. Verify API key has Files API access
3. Try with smaller file first
4. Check browser console for specific errors

### **If Processing Stalls:**
1. Wait longer (large files take time)
2. Check file isn't corrupted
3. Try refreshing page and re-uploading
4. Check API quota in Google Cloud Console

### **If Cleanup Fails:**
1. Files auto-delete after 48 hours anyway
2. Check console for cleanup status
3. Cleanup failure doesn't affect functionality

## ✅ Verification Checklist

- [ ] Small files (< 50MB) process via base64
- [ ] Large files (> 50MB) use Files API
- [ ] Upload progress shows in console
- [ ] File processing completes successfully
- [ ] Files are cleaned up after processing
- [ ] Error messages are clear and helpful
- [ ] Retry logic works on network issues
- [ ] File size validation prevents oversized uploads

The new implementation should be much more reliable and provide better error handling for network issues!
