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
      // Set up API interception before typing
      cy.intercept({
        method: 'POST',
        url: 'http://localhost:8000/api/users/login/',
      }, (req) => {
        req.reply((res) => {
          res.delay = 500;
          res.send({ detail: 'Invalid email or password' });
        });
      }).as('loginRequest');
      
      // Type invalid credentials
      cy.get('#email').type('wrong@example.com');
      cy.get('#password').type('wrongpassword');
      cy.get('button[type="submit"]').click();
      
      // Check loading state
      cy.get('[data-testid="loading-spinner"]').should('exist');
      cy.contains('Logging in...').should('be.visible');
      
      // Wait for request and check response
      cy.wait('@loginRequest');
      
      // Check error toast
      cy.contains('Error').should('be.visible');
      cy.contains('Invalid email or password').should('be.visible');
    });

    it('should successfully log in with valid credentials', () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        profile: {
          name: 'Test User',
          avatarUrl: null
        }
      };

      // Set up API interception before typing
      cy.intercept({
        method: 'POST',
        url: 'http://localhost:8000/api/users/login/',
      }, (req) => {
        req.reply((res) => {
          res.delay = 500;
          res.send({
            access: 'fake-jwt-token',
            refresh: 'fake-refresh-token',
            user: mockUser
          });
        });
      }).as('loginRequest');
      
      // Login
      cy.get('#email').type('test@example.com');
      cy.get('#password').type('testpassword');
      cy.get('button[type="submit"]').click();
      
      // Check loading state
      cy.get('[data-testid="loading-spinner"]').should('exist');
      cy.contains('Logging in...').should('be.visible');
      
      // Wait for requests
      cy.wait('@loginRequest');
      
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
      cy.intercept({
        method: 'POST',
        url: 'http://localhost:8000/api/users/register/',
      }, (req) => {
        req.reply((res) => {
          res.delay = 500;
          res.send({ detail: 'Email already exists' });
        });
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
      cy.contains('Error').should('be.visible');
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
      }, (req) => {
        req.reply((res) => {
          res.delay = 500;
          res.send({
            access: 'fake-jwt-token',
            refresh: 'fake-refresh-token',
            user: newUser
          });
        });
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
      
      cy.wait('@registerRequest');
      
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
      cy.contains('Test User').should('be.visible');
    });

    it('should redirect to login when token is invalid', () => {
      // Set invalid token
      cy.window().then((win) => {
        win.localStorage.setItem('currentUser', JSON.stringify({
          access: 'invalid-token',
          refresh: 'invalid-refresh-token'
        }));
      });
      
      // Try to access protected route
      cy.visit('/chat');
      
      // Should be redirected to login
      cy.url().should('include', '/login');
    });
  });
}); 