const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');
const { deleteImageFromFilePath } = require('../utils/deleteImagesUtils');

describe('Upload Routes', () => {
  let uploadedFilePaths = [];

  afterAll(async () => {
    // Delete the uploaded files
    uploadedFilePaths.forEach(async (filePath) => {
      await deleteImageFromFilePath(filePath);
    });

    // Close the server
    await new Promise((resolve) => app.close(resolve));

    // Close the MongoDB connection
    await mongoose.connection.close();
  });

  describe('POST /uploads', () => {
    it('should upload a file successfully', async () => {
      const response = await request(app)
        .post('/api/uploads')
        .attach('file', 'uploads/rain1.jpg'); // Replace with the actual file path

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('File uploaded successfully');
      uploadedFilePaths.push(response.body.filePath);
    });

    it('should return an error if no file is uploaded', async () => {
      const response = await request(app).post('/api/uploads');

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('No file uploaded');
    });

    // Add more test cases for error scenarios
  });

  describe('DELETE /uploads/:filename', () => {
    it('should delete a file successfully', async () => {
      const response1 = await request(app)
        .post('/api/uploads')
        .attach('file', 'uploads/rain1.jpg'); // Replace with the actual file path
      
      expect(response1.status).toBe(201);
      expect(response1.body.message).toBe('File uploaded successfully'); 

      const response = await request(app).delete(`/api/uploads/${response1.body.filePath}`); // Replace with the actual file path

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('File deleted successfully');
    });

    it('should return an error if the file does not exist', async () => {
      const response = await request(app).delete('/api/uploads/uploads/nonexistent.jpg');

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Failed to delete file');
    });

    // Add more test cases for error scenarios
  });
});
