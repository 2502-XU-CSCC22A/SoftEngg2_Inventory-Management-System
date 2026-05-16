import { describe, it, expect, vi, afterEach } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import models from '../config/db.js';
import bcrypt from 'bcryptjs';

// Mock db
vi.mock('../config/db.js', () => ({
  default: {
    users: {
      findOne: vi.fn(),
      create: vi.fn(),
      update: vi.fn()
    }
  }
}));

// Mock bcrypt
vi.mock('bcryptjs', () => ({
  default: {
    compare: vi.fn(),
    hash: vi.fn(),
    genSalt: vi.fn()
  }
}));

afterEach(() => {
  vi.clearAllMocks();
});

describe('Users Login', () => {
// LOGIN
  it('should return 200/ok if valid login', async () => {
    models.users.findOne.mockResolvedValue({
      user_id: 1,
      username: "user-admin",
      password: "hashedPassword",
      is_admin: true,
      is_active: true
    });

    bcrypt.compare.mockResolvedValue(true);

    const validUser = {
        username: "user-admin",
        password: "Admin123!",
        user_id: 1
    };

    const res = await request(app).post('/users/login').send(validUser);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toMatchObject({
      message: "Login successful",
      user_id: 1,
      username: "user-admin",
      is_admin: true
    });
  });

  //missing fields
    it('should return an error when logging in with missing fields', async () => {
      const invalidUser = {
          username: "user-admin",
      };
      const res = await request(app).post('/users/login').send(invalidUser);
      expect(res.statusCode).toEqual(400);
      //expect(res.body.message).toEqual("");
    });
    //invalid input
    it('should return an error when logging in with invalid input', async () => {
      const invalidUser = {
          username: "user-admin",
          password: "Admin123!",
          user_id: "not a number"
      };
      const res = await request(app).post('/users/login').send(invalidUser);
      expect(res.statusCode).toEqual(400);
      //expect(res.body.message).toEqual("");
    });
    //wrong password
    it('should return an error when logging in with a wrong password', async () => {
        models.users.findOne.mockResolvedValue({
        user_id: 1,
        username: "user-admin",
        password: "hashedPassword",
        is_admin: true,
        is_active: true
      });

      bcrypt.compare.mockResolvedValue(false);

      const invalidUser = {
          username: "user-admin",
          password: "NotMyPassword",
          user_id: 1
      };

      const res = await request(app).post('/users/login').send(invalidUser);
      expect(res.statusCode).toEqual(401);
      //expect(res.body.message).toEqual("");
    });
    //user not found (inactive and not existing)
    it('should return an error when logging in a not found or inactive account', async () => {
      models.users.findOne.mockResolvedValue(null);
      const invalidUser = {
          username: "user-admin",
          password: "Admin123!",
          user_id: 1
      };
      const res = await request(app).post('/users/login').send(invalidUser);
      expect(res.statusCode).toEqual(404);
      //expect(res.body.message).toEqual("");
    });
})

describe('Add User', () => {
//ADD USER
  it('should return 201/created if successfully added user(admin)', async () => {
    models.users.findOne.mockResolvedValue(null);

    bcrypt.genSalt.mockResolvedValue("salt");
    bcrypt.hash.mockResolvedValue("hashedPassword");

    models.users.create.mockResolvedValue({
      user_id: 2,
      username: "newuser",
      is_admin: true
    });

    const validUser = {
        username: "newuser",
        password: "password123",
        confirmPassword: "password123",
        role: "admin"
    };
    const res = await request(app).post('/users').send(validUser);
    expect(res.statusCode).toEqual(201);
    expect(res.body).toMatchObject({
      message: "Adding user successful",
      user_id: 2,
      username: "newuser",
      is_admin: true
    });
  });
  
  it('should return 201/created if successfully added user(employee)', async () => {
    models.users.findOne.mockResolvedValue(null);

    bcrypt.genSalt.mockResolvedValue("salt");
    bcrypt.hash.mockResolvedValue("hashedPassword");

    models.users.create.mockResolvedValue({
      user_id: 2,
      username: "newuser",
      is_admin: false
    });

    const validUser = {
        username: "newuser",
        password: "password123",
        confirmPassword: "password123",
        role: "employee"
    };
    const res = await request(app).post('/users').send(validUser);
    expect(res.statusCode).toEqual(201);
    //expect(res.body.message).toEqual("Adding user successful");
  });

  //missing fields
    it('should return an error when adding user with missing fields', async () => {
      const invalidUser = { username: "username"};
      const res = await request(app).post('/users').send(invalidUser);
      expect(res.statusCode).toEqual(400);
      //expect(res.body.message).toEqual("");
    });
    //invalid input
    it('should return an error when adding user with invalid input', async () => {
      const invalidUser = {
        username: "user",
        password: "password123",
        confirmPassword: "password123",
        role: 123
      };
      const res = await request(app).post('/users').send(invalidUser);
      expect(res.statusCode).toEqual(400);
      //expect(res.body.message).toEqual("");
    });
    //short password (< 8 chars)
    it('should return an error when adding user with a short password', async () => {
      const invalidUser = {
        username: "username",
        password: "pass",
        confirmPassword: "pass",
        role: "admin"
      };
      const res = await request(app).post('/users').send(invalidUser);
      expect(res.statusCode).toEqual(400);
      //expect(res.body.message).toEqual("");
    });
    // invalid role
    it('should return an error when adding user with an invalid role', async () => {
      const invalidUser = {
        username: "username",
        password: "password123",
        confirmPassword: "password123",
        role: "user"
      };
      const res = await request(app).post('/users').send(invalidUser);
      expect(res.statusCode).toEqual(400);
      //expect(res.body.message).toEqual("");
    });
    //passwords dont match
    it('should return an error when adding user with mismatching passwords', async () => {
      const invalidUser = {
        username: "username",
        password: "password123",
        confirmPassword: "password124",
        role: "admin"
      };
      const res = await request(app).post('/users').send(invalidUser);
      expect(res.statusCode).toEqual(400);
      //expect(res.body.message).toEqual("");
    });
    //username already exists
    it('should return an error when adding an existing user', async () => {
      models.users.findOne.mockResolvedValue({
        username: "existingUser"
      });

      const invalidUser = {
        username: "existingUser",
        password: "password123",
        confirmPassword: "password123",
        role: "admin"
      };
      const res = await request(app).post('/users').send(invalidUser);
      expect(res.statusCode).toEqual(409);
      //expect(res.body.message).toEqual("");
    });
})

describe('Archive Users', () => {
//ARCHIVE
  it('should return 200/ok if successfully removed user', async () => {
    models.users.update.mockResolvedValue([1]);

    const res = await request(app).delete('/users/2');
    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toEqual("User removed");
  });

    //user not found
    it('should return an error when removing a non-existent user', async () => {
      models.users.update.mockResolvedValue([0]);
      const res = await request(app).delete('/users/24');
      expect(res.statusCode).toEqual(404);
      //expect(res.body.message).toEqual("");
    });
})
