const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');

describe('Upload Routes', () => {
  afterAll(async () => {
    // Close the server
    await new Promise((resolve) => app.close(resolve));

    // Close the MongoDB connection
    await mongoose.connection.close();
  });

  describe('POST /upload', () => {
    it('should upload a file successfully', async () => {
      const response = await request(app)
        .post('/api/upload')
        .attach('file', 'uploads/cloudy1.jpg'); // Replace 'path/to/file.jpg' with the actual file path

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('File uploaded successfully');
    });

    it('should return an error if no file is uploaded', async () => {
      const response = await request(app).post('/api/upload');

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('No file uploaded');
    });

    // Add more test cases for error scenarios
  });
});
