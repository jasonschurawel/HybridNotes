# Ultra Large File Support (Up to 2GB)

## Overview

HybridNotes now supports processing PDF files up to **2GB** in size using Google's Files API. This represents a **40x increase** from the previous 50MB limit, enabling processing of:

- Large academic papers with extensive references
- Technical manuals with high-resolution diagrams
- Comprehensive reports with detailed charts and images
- Multi-chapter books and documentation
- Scanned documents with high DPI settings

## Technical Implementation

### Two-Tier Processing System

1. **Files ≤ 50MB**: Uses optimized base64 encoding for fast processing
2. **Files > 50MB**: Automatically switches to Google Files API for large file handling

### Files API Integration

- **Upload Process**: Multipart upload with metadata handling
- **Processing Wait**: Automatic polling until file is processed (up to 5 minutes)
- **Error Handling**: Comprehensive error detection and user-friendly messages
- **Timeout Management**: Extended timeouts (5 minutes) for large file processing

## Usage

### File Size Limits
- **Minimum**: No minimum size
- **Small Files**: Up to 50MB (base64 processing)
- **Large Files**: 50MB to 2GB (Files API processing)
- **Maximum**: 2GB hard limit

### Processing Times
- **Small files (< 10MB)**: 30-60 seconds
- **Medium files (10-50MB)**: 1-2 minutes
- **Large files (50MB-500MB)**: 2-5 minutes
- **Very large files (500MB-2GB)**: 5-10 minutes

### User Experience
1. Upload your PDF (up to 2GB)
2. System automatically detects file size and chooses optimal processing method
3. For large files, you'll see extended processing times
4. Real-time status updates during file upload and processing

## API Requirements

### API Key Permissions
Ensure your Google AI API key has access to:
- Generative AI API
- Files API (for files > 50MB)

### Quota Considerations
- Large files consume more API quota
- Processing time is proportional to file size
- Consider API limits when processing multiple large files

## Error Handling

### Common Issues and Solutions

1. **"Files API upload failed"**
   - Check internet connection
   - Verify API key has Files API access
   - Ensure file is not corrupted

2. **"File processing timeout"**
   - Large files may take up to 10 minutes
   - Check file integrity
   - Try splitting very large files

3. **"Metadata part is too large"**
   - File may have complex metadata
   - Try saving PDF with reduced metadata
   - Use PDF optimization tools

4. **"Quota exceeded"**
   - Check Google Cloud billing
   - Monitor API usage limits
   - Consider processing during off-peak hours

## Best Practices

### For Optimal Performance
1. **File Optimization**: Use PDF compression when possible
2. **Network**: Ensure stable internet connection for large uploads
3. **Timing**: Process large files during low-traffic periods
4. **Monitoring**: Watch console logs for detailed progress information

### File Preparation
- Remove unnecessary metadata
- Optimize images within PDF
- Consider splitting extremely large documents
- Ensure PDF is not password-protected

## Technical Specifications

### Network Requirements
- **Upload Speed**: Minimum 10 Mbps recommended for large files
- **Stability**: Stable connection required (uploads resume not supported)
- **Timeout**: 5-minute maximum for file processing

### Memory Usage
- Client-side processing optimized for large files
- Files API reduces browser memory usage
- Background processing prevents UI blocking

## Troubleshooting

### Debug Information
Enable browser console to see detailed logs:
- File size detection
- Processing method selection
- Upload progress
- API response details

### Common Solutions
1. **Refresh page** and try again
2. **Check file integrity** with another PDF viewer
3. **Verify API key** has correct permissions
4. **Test with smaller file** to isolate issues

## Migration from 50MB Limit

### Automatic Upgrade
- No changes needed for existing workflows
- Files ≤ 50MB continue using previous method
- Files > 50MB automatically use new Files API
- All existing features remain compatible

### New Capabilities
- Process academic papers with extensive appendices
- Handle technical manuals with high-resolution diagrams
- Work with scanned books and large documentation sets
- Support multi-volume document processing

## Future Enhancements

### Planned Features
- Resume interrupted uploads
- Batch processing for multiple large files
- Progress indicators for upload and processing
- Advanced file compression options

### Performance Optimizations
- Parallel processing for multiple files
- Cached processing for similar content
- Optimized retry logic for network issues
- Enhanced error recovery mechanisms

---

For additional support or questions about large file processing, please check the troubleshooting guide or create an issue in the repository.
