describe("Profile Page", () => {
  beforeEach(() => {
    // Clear any existing state
    cy.clearLocalStorage();
    cy.clearCookies();

    // Login first
    cy.login("test@example.com", "testpassword");

    // Now intercept the getCurrentUser request that will be made when visiting the profile page
    cy.intercept("GET", "http://localhost:8000/api/users/me/", {
      statusCode: 200,
      body: {
        id: 1,
        email: "test@example.com",
        profile: {
          name: "Test User",
          gender: "male",
          dob: "1990-01-01",
          createdAt: "2024-01-01T00:00:00.000Z",
          avatarUrl: null,
          avatarColor: "bg-purple-500",
        },
      },
    }).as("getCurrentUser");

    // Visit the profile page
    cy.visit("/profile");
    cy.wait("@getCurrentUser");
  });

  describe("Page Load", () => {
    it("should load the profile page successfully", () => {
      // Check page title and structure
      cy.contains("h1", "My Profile").should("be.visible");

      cy.get('[data-testid="profile-card"]').should("exist");
      cy.contains("Personal Information").should("be.visible");

      // Check if all profile sections are present
      cy.contains(".text-sm.font-medium", "Name").should("be.visible");
      cy.contains(".text-sm.font-medium", "Email").should("be.visible");
      cy.contains(".text-sm.font-medium", "Gender").should("be.visible");
      cy.contains(".text-sm.font-medium", "Date of Birth").should("be.visible");
      cy.contains(".text-sm.font-medium", "Joined on").should("be.visible");

      // Check if user information is displayed correctly
      cy.contains("test@example.com").should("be.visible");
      cy.contains("Test User").should("be.visible");

      cy.contains("male").should("be.visible").and("have.class", "capitalize");

      cy.contains("1990-01-01").should("be.visible");

      // Check avatar section
      cy.get("button").contains("Upload Avatar").should("be.visible");
      cy.get('[data-testid="avatar-upload"]').should("exist");

      // Since we have no avatarUrl, color selection should be visible
      cy.contains("Or choose a color:").should("be.visible");
      cy.get("button").contains("Change avatar color").should("be.visible");
    });
  });

  describe("Profile Information Display", () => {
    it("should display all user information correctly", () => {
      // Check profile card structure
      cy.get('[data-testid="profile-card"]')
        .should("exist")
        .within(() => {
          // Check section title
          cy.contains("Personal Information").should("be.visible");

          // Check all field labels
          cy.contains(".text-sm.font-medium", "Name").should("be.visible");
          cy.contains(".text-sm.font-medium", "Email").should("be.visible");
          cy.contains(".text-sm.font-medium", "Gender").should("be.visible");
          cy.contains(".text-sm.font-medium", "Date of Birth").should(
            "be.visible",
          );
          cy.contains(".text-sm.font-medium", "Joined on").should("be.visible");

          // Check field values
          cy.contains("Test User").should("be.visible");
          cy.contains("test@example.com").should("be.visible");
          cy.contains("male")
            .should("be.visible")
            .and("have.class", "capitalize");
          cy.contains("1990-01-01").should("be.visible");

          // Check email note
          cy.contains("Email cannot be changed")
            .should("be.visible")
            .and("have.class", "text-xs")
            .and("have.class", "text-muted-foreground");

          // Check edit buttons presence
          cy.get('button[aria-label="Edit name"]').should("be.visible");
          cy.get('button[aria-label="Edit gender"]').should("be.visible");
          cy.get('button[aria-label="Edit date of birth"]').should(
            "be.visible",
          );
        });
    });

    it("should display avatar section correctly", () => {
      // Check avatar container
      cy.get(".flex.justify-center.mb-8").within(() => {
        // Check user info below avatar
        cy.contains("Test User").should("be.visible");
        cy.contains("test@example.com").should("be.visible");

        // Check avatar upload button
        cy.get("button")
          .contains("Upload Avatar")
          .should("be.visible")
          // .and('have.class', 'sm')
          .find("svg") // Check for upload icon
          .should("exist");

        // Check hidden file input
        cy.get('[data-testid="avatar-upload"]')
          .should("exist")
          .and("have.class", "hidden")
          .and("have.attr", "accept", "image/*");

        // Since we have no avatarUrl, check color selection visibility
        cy.contains("Or choose a color:")
          .should("be.visible")
          .and("have.class", "text-xs")
          .and("have.class", "text-muted-foreground");

        cy.get("button").contains("Change avatar color").should("be.visible");
      });
    });

    it("should format dates correctly", () => {
      // Get the current date in YYYY-MM-DD format for comparison
      const today = new Date();
      const formattedToday = today.toISOString().split("T")[0];

      // Intercept with various date formats
      cy.intercept("GET", "http://localhost:8000/api/users/me/", {
        statusCode: 200,
        body: {
          id: 1,
          email: "test@example.com",
          profile: {
            name: "Test User",
            gender: "male",
            dob: formattedToday, // Today's date
            createdAt: "2024-01-01T00:00:00.000Z",
            avatarUrl: null,
            avatarColor: "bg-purple-500",
          },
        },
      }).as("getUserWithDates");

      // Reload page to get new dates
      cy.visit("/profile");
      cy.wait("@getUserWithDates");

      // Check date formatting
      cy.get('[data-testid="profile-card"]').within(() => {
        // DOB should be in YYYY-MM-DD format
        cy.contains(formattedToday).should("be.visible");

        // Joined date should be in localized format
        cy.contains("01/01/2024").should("be.visible");
      });
    });

    it("should handle missing or empty values", () => {
      // Intercept with missing values
      cy.intercept("GET", "http://localhost:8000/api/users/me/", {
        statusCode: 200,
        body: {
          id: 1,
          email: "test@example.com",
          profile: {
            name: "",
            gender: "",
            dob: "",
            createdAt: "",
            avatarUrl: null,
            avatarColor: null,
          },
        },
      }).as("getUserWithEmptyValues");

      // Visit profile page
      cy.visit("/profile");
      cy.wait("@getUserWithEmptyValues");

      // Check if N/A is displayed for empty values
      cy.get('[data-testid="profile-card"]').within(() => {
        cy.contains("Name").parent().contains("N/A").should("be.visible");
        cy.contains("Gender").parent().contains("N/A").should("be.visible");
        cy.contains("Date of Birth")
          .parent()
          .contains("N/A")
          .should("be.visible");
        cy.contains("Joined on").parent().contains("N/A").should("be.visible");
      });

      // Email should still be visible as it's required
      cy.contains("test@example.com").should("be.visible");
    });
  });

  describe("Name Editing", () => {
    beforeEach(() => {
      // Start from profile card section for name editing tests
      cy.get('[data-testid="profile-card"]').as("profileCard");
    });

    it("should allow editing the name", () => {
      // Click edit button
      cy.get("@profileCard").within(() => {
        cy.get('button[aria-label="Edit name"]').click();
      });

      // Verify edit mode is active
      cy.get('input[aria-label="Name"]')
        .should("be.visible")
        .and("have.value", "Test User");

      // Intercept the update request
      cy.intercept("PUT", "http://localhost:8000/api/users/me/", {
        statusCode: 200,
        body: {
          id: 1,
          email: "test@example.com",
          profile: {
            name: "New Test Name",
            gender: "male",
            dob: "1990-01-01",
            createdAt: "2024-01-01T00:00:00.000Z",
            avatarUrl: null,
            avatarColor: "bg-purple-500",
          },
        },
      }).as("updateName");

      // Type new name
      cy.get('input[aria-label="Name"]').clear().type("New Test Name");

      // Click save
      cy.get("button").contains("Save").click();

      // Verify request
      cy.wait("@updateName").then((interception) => {
        expect(interception.request.body).to.deep.equal({
          profile: { name: "New Test Name" },
        });
      });

      // Verify success toast
      cy.contains("Profile Updated").should("be.visible");
      cy.contains("Your name has been updated").should("be.visible");

      // Verify edit mode is closed and new name is displayed
      cy.get('input[aria-label="Name"]').should("not.exist");
      cy.contains("New Test Name").should("be.visible");
    });
  });

  describe("Gender Selection", () => {
    beforeEach(() => {
      // Start from profile card section for gender selection tests
      cy.get('[data-testid="profile-card"]').as("profileCard");
    });

    it("should allow changing gender", () => {
      // Click edit button for gender
      cy.get("@profileCard").within(() => {
        cy.get('button[aria-label="Edit gender"]').click();
      });

      // Verify select component appears
      cy.get('[role="combobox"]')
        .should("be.visible")
        .and("have.class", "w-40"); // SelectTrigger width class

      // Open select dropdown
      cy.get('[role="combobox"]').click();

      // Verify all options are present
      cy.get('[role="option"]').should("have.length", 3);
      cy.get('[role="listbox"]').within(() => {
        cy.get('[role="option"]').eq(0).should("contain", "Male");
        cy.get('[role="option"]').eq(1).should("contain", "Female");
        cy.get('[role="option"]').eq(2).should("contain", "Other");
      });

      // Intercept the update request
      cy.intercept("PUT", "http://localhost:8000/api/users/me/", {
        statusCode: 200,
        body: {
          id: 1,
          email: "test@example.com",
          profile: {
            name: "Test User",
            gender: "female",
            dob: "1990-01-01",
            createdAt: "2024-01-01T00:00:00.000Z",
            avatarUrl: null,
            avatarColor: "bg-purple-500",
          },
        },
      }).as("updateGender");

      // Select new gender
      cy.get('[role="option"]').contains("Female").click();

      // Click save
      cy.get("button").contains("Save").click();

      // Verify request
      cy.wait("@updateGender").then((interception) => {
        expect(interception.request.body).to.deep.equal({
          profile: { gender: "female" },
        });
      });

      // Verify success toast
      cy.contains("Profile Updated").should("be.visible");
      cy.contains("Your gender has been updated").should("be.visible");

      // Verify select is closed and new value is displayed
      cy.get('[role="combobox"]').should("not.exist");
    });
  });

  describe("Date of Birth Updates", () => {
    beforeEach(() => {
      // Start from profile card section for DOB tests
      cy.get('[data-testid="profile-card"]').as("profileCard");
    });

    it("should allow updating date of birth", () => {
      // Click edit button for DOB
      cy.get("@profileCard").within(() => {
        cy.get('button[aria-label="Edit date of birth"]').click();
      });

      // Verify date input appears with current value
      cy.get('input[type="date"][aria-label="Date of Birth"]')
        .should("be.visible")
        .and("have.value", "1990-01-01");

      const newDate = "2000-06-15";

      // Intercept the update request
      cy.intercept("PUT", "http://localhost:8000/api/users/me/", {
        statusCode: 200,
        body: {
          id: 1,
          email: "test@example.com",
          profile: {
            name: "Test User",
            gender: "male",
            dob: newDate,
            createdAt: "2024-01-01T00:00:00.000Z",
            avatarUrl: null,
            avatarColor: "bg-purple-500",
          },
        },
      }).as("updateDOB");

      // Enter new date
      cy.get('input[type="date"][aria-label="Date of Birth"]')
        .clear()
        .type(newDate);

      // Click save
      cy.get("button").contains("Save").click();

      // Verify request
      cy.wait("@updateDOB").then((interception) => {
        expect(interception.request.body).to.deep.equal({
          profile: { dob: newDate },
        });
      });

      // Verify success toast
      cy.contains("Profile Updated").should("be.visible");
      cy.contains("Your dob has been updated").should("be.visible");

      // Verify date input is closed and new value is displayed
      cy.get('input[type="date"]').should("not.exist");
      cy.contains(newDate).should("be.visible");
    });

    it("should validate date input", () => {
      // Click edit button
      cy.get("@profileCard").within(() => {
        cy.get('button[aria-label="Edit date of birth"]').click();
      });

      // Test future date
      const futureDate = "2025-01-01";
      cy.get('input[type="date"][aria-label="Date of Birth"]')
        .clear()
        .type(futureDate);

      // Try to save future date
      cy.get("button").contains("Save").click();

      // Should still show the input (invalid date)
      cy.get('input[type="date"]').should("exist");

      // Test very old date
      const oldDate = "1900-01-01";
      cy.get('input[type="date"][aria-label="Date of Birth"]')
        .clear()
        .type(oldDate);

      // Intercept the update request for old date
      cy.intercept("PUT", "http://localhost:8000/api/users/me/", {
        statusCode: 200,
        body: {
          id: 1,
          email: "test@example.com",
          profile: {
            name: "Test User",
            gender: "male",
            dob: oldDate,
            createdAt: "2024-01-01T00:00:00.000Z",
            avatarUrl: null,
            avatarColor: "bg-purple-500",
          },
        },
      }).as("updateOldDOB");

      // Save old date
      cy.get("button").contains("Save").click();
      cy.wait("@updateOldDOB");

      // Verify old date is accepted
      cy.contains(oldDate).should("be.visible");

      // Test empty date
      cy.get('button[aria-label="Edit date of birth"]').click();
      cy.get('input[type="date"][aria-label="Date of Birth"]').clear();

      // Intercept the update request for empty date
      cy.intercept("PUT", "http://localhost:8000/api/users/me/", {
        statusCode: 200,
        body: {
          id: 1,
          email: "test@example.com",
          profile: {
            name: "Test User",
            gender: "male",
            dob: "",
            createdAt: "2024-01-01T00:00:00.000Z",
            avatarUrl: null,
            avatarColor: "bg-purple-500",
          },
        },
      }).as("updateEmptyDOB");

      // Save empty date
      cy.get("button").contains("Save").click();
      cy.wait("@updateEmptyDOB");

      // Verify empty date shows as N/A
      cy.contains("N/A").should("be.visible");
    });
  });

  describe("Avatar Management", () => {
    beforeEach(() => {
      // Create a test image file
      cy.fixture("test-avatar.jpeg").as("testImage");
    });

    it("should allow uploading a new avatar", () => {
      // Prepare the file upload
      cy.get<string>("@testImage").then((testImage) => {
        // Create a File object from the base64 image
        const blob = Cypress.Blob.base64StringToBlob(testImage, "image/jpeg");
        // const file = new File([blob], "test-avatar.jpeg", {
        //   type: "image/jpeg",
        // });

        // Intercept the upload request
        cy.intercept("POST", "http://localhost:8000/api/users/me/avatar", {
          statusCode: 200,
          body: {
            avatarUrl: "https://example.com/avatars/test-avatar.jpeg",
          },
        }).as("uploadAvatar");

        // Intercept the profile update request
        cy.intercept("PUT", "http://localhost:8000/api/users/me/", {
          statusCode: 200,
          body: {
            id: 1,
            email: "test@example.com",
            profile: {
              name: "Test User",
              gender: "male",
              dob: "1990-01-01",
              createdAt: "2024-01-01T00:00:00.000Z",
              avatarUrl: "https://example.com/avatars/test-avatar.jpeg",
              avatarColor: null,
            },
          },
        }).as("updateProfile");

        // Trigger file selection
        cy.get('[data-testid="avatar-upload"]').attachFile({
          fileContent: testImage,
          fileName: "test-avatar.jpeg",
          mimeType: "image/jpeg",
        });

        // Wait for upload and update requests
        cy.wait("@uploadAvatar");
        cy.wait("@updateProfile");

        // Verify success messages
        cy.contains("Avatar Updated").should("be.visible");
        cy.contains("Your avatar has been updated successfully").should(
          "be.visible",
        );

        // Verify color selection is hidden when avatar is present
        cy.contains("Or choose a color:").should("not.exist");
        cy.get("button").contains("Change avatar color").should("not.exist");
      });
    });

    it("should validate avatar file type and size", () => {
      // Test invalid file type
      cy.fixture("invalid-file.txt").then((invalidFile) => {
        cy.get('[data-testid="avatar-upload"]').attachFile({
          fileContent: invalidFile,
          fileName: "invalid-file.txt",
          mimeType: "text/plain",
        });

        // Verify error message
        cy.contains("Invalid File Type").should("be.visible");
        cy.contains("Please select an image file.").should("be.visible");
      });

      // Test file too large (>2MB)
      cy.fixture("large-image.png").then((largeImage) => {
        const largeBlob = new Blob(
          [Cypress.Blob.base64StringToBlob(largeImage, "image/png")],
          {
            type: "image/png",
          },
        );
        // Mock file size to be > 2MB
        Object.defineProperty(largeBlob, "size", { value: 3 * 1024 * 1024 });

        cy.get('[data-testid="avatar-upload"]').attachFile({
          fileContent: largeImage,
          fileName: "large-image.png",
          mimeType: "image/png",
        });

        // Verify error message
        cy.contains("File Too Large").should("be.visible");
        cy.contains("Please select an image smaller than 2MB.").should(
          "be.visible",
        );
      });
    });

    it("should allow selecting avatar color when no image is uploaded", () => {
      // Click change avatar color button
      cy.get("button").contains("Change avatar color").click();

      // Verify color select appears
      cy.get(".w-40").should("be.visible");

      // Open color dropdown
      cy.get(":nth-child(4) > .h-10").click();

      // Verify all color options are present
      ["Purple", "Blue", "Green", "Yellow", "Pink", "Indigo"].forEach(
        (color) => {
          cy.contains('[role="option"]', color)
            .should("be.visible")
            .find("div") // Color preview div
            .should("have.class", `bg-${color.toLowerCase()}-500`);
        },
      );

      // Select a new color
      cy.contains('[role="option"]', "Blue").click();

      // Intercept the update request
      cy.intercept("PUT", "http://localhost:8000/api/users/me/", {
        statusCode: 200,
        body: {
          id: 1,
          email: "test@example.com",
          profile: {
            name: "Test User",
            gender: "male",
            dob: "1990-01-01",
            createdAt: "2024-01-01T00:00:00.000Z",
            avatarUrl: null,
            avatarColor: "bg-blue-500",
          },
        },
      }).as("updateAvatarColor");

      // Save color selection
      cy.get("button").contains("Save").click();

      // Verify request
      cy.wait("@updateAvatarColor").then((interception) => {
        expect(interception.request.body).to.deep.equal({
          profile: { avatarColor: "bg-blue-500" },
        });
      });

      // Verify success message
      cy.contains("Profile Updated").should("be.visible");
      cy.contains("Your avatarColor has been updated").should("be.visible");
    });

    it("should handle avatar upload API errors", () => {
      cy.get<string>("@testImage").then((testImage) => {
        // Intercept with error
        cy.intercept("POST", "http://localhost:8000/api/users/me/avatar", {
          statusCode: 500,
          body: {
            error: "Failed to upload avatar",
          },
        }).as("uploadError");

        // Attempt upload
        cy.get('[data-testid="avatar-upload"]').attachFile({
          fileContent: testImage,
          fileName: "test-avatar.jpeg",
          mimeType: "image/jpeg",
        });

        // Wait for failed request
        cy.wait("@uploadError");

        // Verify error messages
        cy.contains("Upload Failed").should("be.visible");
        cy.contains("Could not upload avatar").should("be.visible");

        // Verify color selection is still available
        cy.contains("Or choose a color:").should("be.visible");
        cy.get("button").contains("Change avatar color").should("be.visible");
      });
    });
  });
});
