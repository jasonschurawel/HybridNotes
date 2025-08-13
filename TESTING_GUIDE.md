# 🧪 Testing Guide for Large File Support

## 📋 **Test Scenarios**

### ✅ **Small Files (< 15MB)**
Test that small files still work with the original direct upload method:

1. **Upload a small PDF (< 15MB)**
   - Expected: Direct base64 processing
   - Console log: "Small file (X.XMB). Using direct base64 upload..."
   - Processing: Fast, no intermediate upload

### ✅ **Medium Files (15MB - 100MB)**
Test Files API integration for medium-sized files:

1. **Upload a medium PDF (15-100MB)**
   - Expected: Files API processing
   - Console log: "Large file detected (X.XMB). Using Files API for upload..."
   - Processing: Upload → Process → Cleanup

### ✅ **Large Files (100MB - 2GB)**
Test maximum capability:

1. **Upload a large PDF (100MB - 2GB)**
   - Expected: Files API processing with status monitoring
   - Console logs:
     - "Large file detected..."
     - "File uploaded successfully via Files API..."
     - "File is being processed, waiting..."
     - "File processed successfully, ready for use"

### ❌ **Oversized Files (> 2GB)**
Test file size validation:

1. **Upload a file > 2GB**
   - Expected: Clear error message
   - Error: "File size (X.XGB) exceeds the 2GB limit. Please use a smaller PDF file."

## 🔧 **Testing Commands**

### **Development Testing**
```bash
# Start development server
npm run dev

# Open browser to http://localhost:5173/
# Test with various file sizes
```

### **Production Testing** 
```bash
# Build and preview
npm run build
npm run preview

# Test in production environment
```

## 🐛 **Debugging Guide**

### **Console Monitoring**
Monitor these key log messages:

```javascript
// File size detection
"Processing PDF: filename.pdf, Size: X.XXMB"

// Method selection
"Small file (X.XMB). Using direct base64 upload..."
// OR
"Large file detected (X.XMB). Using Files API for upload..."

// Files API workflow
"File uploaded successfully via Files API: files/abc123"
"File is being processed, waiting..."
"File processed successfully, ready for use"

// API communication
"Sending request to Gemini API..."
"Received response from Gemini API"

// Cleanup
"Cleaning up uploaded file..."
```

### **Error Scenarios**

#### **Network Errors**
```
- "Files API upload failed: 500 Internal Server Error"
- "Failed to check file status: 404"
- "Network error. Please check your internet connection"
```

#### **Timeout Errors**
```
- "File reading timeout. The file may be too large or corrupted"
- "API request timeout after 120 seconds"
```

#### **File Processing Errors**
```
- "File processing failed on server side"
- "Failed to upload large file: [specific error]"
```

## 📊 **Performance Expectations**

| File Size | Upload Time | Processing Time | Memory Usage |
|-----------|-------------|-----------------|--------------|
| 5MB | < 5s | 10-30s | Low |
| 25MB | 10-30s | 30-60s | Low |
| 100MB | 30-120s | 60-180s | Low |
| 500MB | 2-10min | 3-15min | Low |
| 1GB+ | 5-20min | 5-30min | Low |

## 🛠️ **Troubleshooting Steps**

### **If Upload Fails**
1. Check file size (< 2GB)
2. Verify PDF format
3. Check internet connection
4. Try smaller file first
5. Check browser console for errors

### **If Processing Stalls**
1. Wait longer (large files take time)
2. Check API key validity
3. Verify API quota/billing
4. Try refreshing and re-uploading

### **If Files Don't Clean Up**
Files auto-delete after 48 hours, but manual cleanup should work:
1. Check console for cleanup messages
2. Files API will auto-clean if manual fails
3. No action needed from user

## 🎯 **Success Criteria**

✅ **Small files** process as before (< 5 seconds upload)  
✅ **Medium files** process via Files API (complete within 5 minutes)  
✅ **Large files** process successfully (up to 2GB)  
✅ **Oversized files** show clear error messages  
✅ **All files** clean up automatically after processing  
✅ **Network errors** retry with exponential backoff  
✅ **User feedback** is clear and informative throughout  

## 📝 **Test Checklist**

- [ ] Test 5MB PDF → Direct upload
- [ ] Test 25MB PDF → Files API  
- [ ] Test 100MB PDF → Files API with monitoring
- [ ] Test 3GB file → Clear error message
- [ ] Test invalid file type → Validation error
- [ ] Test network interruption → Retry logic
- [ ] Test API key issues → Clear error messages
- [ ] Verify cleanup in console logs
- [ ] Test in both development and production
- [ ] Verify UI shows file size limits correctly

---

**Ready for comprehensive testing!** 🚀
