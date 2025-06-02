/// <reference types="cypress" />

describe('Authentication', () => {
  beforeEach(() => {
    // Reset any previous state
    cy.clearLocalStorage();
    cy.clearCookies();

  });

  describe('Login', () => {
    beforeEach(() => {
      cy.visit('/login');
    });

    it('should show validation errors for invalid input', () => {
      // Try to submit empty form
      cy.get('button[type="submit"]').click();

      // Check for browser's built-in validation messages
      cy.get('#email:invalid').should('exist');
      cy.get('#password:invalid').should('exist');
    });

    it('should show error for invalid credentials', () => {
      // Intercept for invalid credentials
      cy.intercept('POST', 'http://localhost:8000/api/users/login/', (req) => {
        if (req.body.email === 'wrong@example.com') {
          req.reply({
            statusCode: 401,
            body: { detail: 'Invalid email or password' },
            delay: 300 // Add 1 second delay to simulate network latency
          });
        }
      }).as('loginFailedRequest');

      // Type invalid credentials
      cy.get('#email').type('wrong@example.com');
      cy.get('#password').type('wrongpassword');
      cy.get('button[type="submit"]').click();

      // Check loading state
      cy.get('[data-testid="loading-spinner"]').should('exist');
      cy.contains('Logging in...').should('be.visible');

      // Wait for request and check response
      cy.wait('@loginFailedRequest').then((interception) => {
        expect(interception.request.body).to.deep.equal({
          email: 'wrong@example.com',
          password: 'wrongpassword'
        });
      });

      // Check error toast
      cy.contains('Login Failed').should('be.visible');
      cy.contains('Authentication failed').should('be.visible');
    });

    it('should successfully log in with valid credentials', () => {
      // Set up API interception for all auth-related endpoints
      cy.intercept('POST', 'http://localhost:8000/api/users/login/', {
        statusCode: 200,
        delay: 300,
        body: {
          access: 'fake-jwt-token',
          refresh: 'fake-refresh-token',
        }
      }).as('loginRequest');


      // Login
      cy.get('#email').type('test@example.com');
      cy.get('#password').type('testpassword');
      cy.get('button[type="submit"]').click();

      // Check loading state
      cy.get('[data-testid="loading-spinner"]').should('exist');
      cy.contains('Logging in...').should('be.visible');

      // Intercept the getCurrentUser request that follows successful login
      cy.intercept('GET', 'http://localhost:8000/api/users/me/', {
        statusCode: 200,
        body: {
          id: 1,
          email: 'test@example.com',
          profile: {
            name: 'Test User',
            gender: 'other',
            dob: '1990-01-01',
            createdAt: '2024-01-01T00:00:00Z',
            avatarUrl: 'https://example.com/avatar.jpg',
            avatarColor: '#3498db'
          }
        }
      }).as('getCurrentUser');


      // Wait for requests and verify request body
      cy.wait('@loginRequest').then((interception) => {
        expect(interception.request.body).to.deep.equal({
          email: 'test@example.com',
          password: 'testpassword'
        });
      });

      // Wait for getCurrentUser request to complete
      cy.wait('@getCurrentUser').then((interception) => {

        // Verify request was made with proper authorization header
        expect(interception.request.headers).to.have.property('authorization', 'Bearer fake-jwt-token');
      });

      // Check success toast
      cy.contains('Login Successful').should('be.visible');
      cy.contains('Welcome back!').should('be.visible');

      // Should redirect to chat
      cy.url().should('include', '/chat');

      // Verify user data is stored
      cy.window().then((win) => {
        const userData = JSON.parse(win.localStorage.getItem('currentUser') || '{}');
        expect(userData).to.have.property('access', 'fake-jwt-token');
        expect(userData).to.have.property('refresh', 'fake-refresh-token');
      });
    });
  });

  describe('Registration', () => {
    beforeEach(() => {
      cy.visit('/register');
    });

    it('should show validation errors for invalid registration input', () => {
      cy.get('button[type="submit"]').click();

      // Check for browser's built-in validation messages
      cy.get('#name:invalid').should('exist');
      cy.get('#email:invalid').should('exist');
      cy.get('#password:invalid').should('exist');
      cy.get('#dob:invalid').should('exist');
    });

    it('should show error for existing email', () => {
      // Set up API interception before filling the form
      cy.intercept('POST', 'http://localhost:8000/api/users/register/', {
        statusCode: 409,
        delay: 300,
        body: {
          detail: 'Email already exists'
        }
      }).as('registerRequest');

      // Fill in all required fields
      cy.get('#name').type('Test User');
      cy.get('#email').type('existing@example.com');
      cy.get('#password').type('password123');
      cy.get('#dob').type('2000-01-01');

      // Select gender
      cy.get('[data-testid="gender-trigger"]').click();
      cy.get('[data-testid="gender-option-male"]').click();

      cy.get('button[type="submit"]').click();

      // Check loading state
      cy.get('[data-testid="loading-spinner"]').should('exist');
      cy.contains('Registering...').should('be.visible');

      cy.wait('@registerRequest');

      // Check error toast
      cy.contains('Registration Failed').should('be.visible');
      cy.contains('Email already exists').should('be.visible');
    });

    it('should successfully register new user', () => {
      const newUser = {
        id: 2,
        email: 'new@example.com',
        profile: {
          name: 'New User',
          avatarUrl: null
        }
      };

      // Set up API interception before filling the form
      cy.intercept({
        method: 'POST',
        url: 'http://localhost:8000/api/users/register/',
      }, {
        statusCode: 201,
        delay: 300,
        body: {
          access: 'fake-jwt-token',
          refresh: 'fake-refresh-token'
        }
      }).as('registerRequest');

      // Fill in registration form
      cy.get('#name').type('New User');
      cy.get('#email').type('new@example.com');
      cy.get('#password').type('password123');
      cy.get('#dob').type('2000-01-01');

      // Select gender
      cy.get('[data-testid="gender-trigger"]').click();
      cy.get('[data-testid="gender-option-female"]').click();

      cy.get('button[type="submit"]').click();

      // Check loading state
      cy.get('[data-testid="loading-spinner"]').should('exist');
      cy.contains('Registering...').should('be.visible');

      // Intercept user profile fetch after registration
      cy.intercept({
        method: 'GET',
        url: 'http://localhost:8000/api/users/me/',
      }, {
        statusCode: 200,
        body: {
          id: 2,
          email: 'new@example.com',
          profile: {
            name: 'New User',
            gender: 'female',
            dob: '2000-01-01',
            avatarUrl: null,
            avatarColor: '#3498db'
          }
        }
      }).as('getCurrentUser');

      cy.wait('@registerRequest').then((interception) => {
        expect(interception.request.body).to.deep.equal({
          name: 'New User',
          email: 'new@example.com', 
          password: 'password123',
          gender: 'female',
          dob: '2000-01-01'
        });
      });

      cy.wait('@getCurrentUser').then((interception) => {
        // Verify request was made with proper authorization header
        expect(interception.request.headers).to.have.property('authorization', 'Bearer fake-jwt-token');
      });

      // Check success toast
      cy.contains('Registration Successful').should('be.visible');
      cy.contains('Your account has been created').should('be.visible');

      // Should redirect to chat
      cy.url().should('include', '/chat');

      // Verify user data is stored
      cy.window().then((win) => {
        const userData = JSON.parse(win.localStorage.getItem('currentUser') || '{}');
        expect(userData).to.have.property('access', 'fake-jwt-token');
        expect(userData).to.have.property('refresh', 'fake-refresh-token');
      });
    });
  });

  describe('Logout', () => {
    beforeEach(() => {
      // Setup authenticated state
      cy.window().then((win) => {
        win.localStorage.setItem('currentUser', JSON.stringify({
          id: 1,
          email: 'test@example.com',
          profile: {
            name: 'Test User',
            avatarUrl: null
          },
          access: 'fake-jwt-token',
          refresh: 'fake-refresh-token'
        }));
      });

      // Visit chat page
      cy.visit('/chat');
    });

    it('should successfully log out', () => {
      // Click logout button in the navbar
      cy.get('[data-testid="logout-button"]').click();

      // Verify user is logged out
      cy.url().should('include', '/');
      cy.window().then((win) => {
        expect(win.localStorage.getItem('currentUser')).to.be.null;
      });
    });
  });

  describe('Token Persistence', () => {
    it('should persist authentication across page reloads', () => {
      // Set up initial authenticated state
      cy.window().then((win) => {
        win.localStorage.setItem('currentUser', JSON.stringify({
          id: 1,
          email: 'test@example.com',
          profile: {
            name: 'Test User',
            avatarUrl: null
          },
          access: 'fake-jwt-token',
          refresh: 'fake-refresh-token'
        }));
      });

      // Visit chat page
      cy.visit('/chat');

      // Verify we're on chat page
      cy.url().should('include', '/chat');

      // Reload page
      cy.reload();

      // Verify still on chat page
      cy.url().should('include', '/chat');
      cy.contains('My Account').should('be.visible');
    });

    it('should redirect to login when token is invalid', () => {
      // Set invalid token
      cy.window().then((win) => {
        win.localStorage.setItem('currentUser', JSON.stringify({
          access: 'invalid-token',
          refresh: 'invalid-refresh-token'
        }));
      });

      // Intercept all API requests and respond with 401 Unauthorized
      cy.intercept('GET', 'http://localhost:8000/api/**', {
        statusCode: 401,
        body: {
          detail: 'Invalid or expired token'
        }
      }).as('unauthorizedRequest');

      
      // Try to access protected route
      cy.visit('/chat');

      // Should be redirected to login
      cy.url().should('include', '/login');
    });
  });
}); 