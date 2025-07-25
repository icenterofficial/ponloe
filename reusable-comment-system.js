/**
 * @file reusable-comment-system.js
 * @description A reusable comment system powered by Google Apps Script.
 * @version 1.0.0
 * @author (Your Name)
 * 
 * This script provides functionality to initialize a comment section on any page.
 * It handles fetching comments, submitting new ones, and differentiating
 * between logged-in users and guests.
 */

/**
 * Initializes a comment system on the page.
 * @param {object} options - The configuration object for the comment system.
 * @param {string} options.scriptUrl - The URL of the deployed Google Apps Script.
 * @param {string} options.pageId - A unique identifier for the page where comments are displayed (e.g., 'about-us', 'post-slug-123').
 * @param {string} options.formId - The ID of the <form> element for submitting comments.
 * @param {string} options.commentInputId - The ID of the <textarea> for the comment body.
 * @param {string} options.listContainerId - The ID of the <div> where comments will be displayed.
 * @param {string} options.loadingIndicatorId - The ID of the element to show while comments are loading.
 * @param {string} [options.commentCountId] - (Optional) The ID of a <span> to display the number of comments.
 * @param {object} [options.userProfile] - (Optional) An object containing the logged-in user's data. Should have a 'name' property.
 * @param {string} [options.guestNameInputId] - (Optional) The ID of the <input> for a guest's name. Required if userProfile is not always present.
 * @param {string} [options.userInfoContainerId] - (Optional) The ID of the <div> that shows the logged-in user's name.
 * @param {string} [options.userNameDisplayId] - (Optional) The ID of the <span> inside userInfoContainerId to display the user's name.
 * @param {string} [options.guestNameContainerId] - (Optional) The ID of the <div> containing the guest name input field.
 */
function initializeCommentSystem(options) {
    // --- Destructure and validate options ---
    const {
        scriptUrl,
        pageId,
        formId,
        commentInputId,
        listContainerId,
        loadingIndicatorId,
        commentCountId,
        userProfile,
        guestNameInputId,
        userInfoContainerId,
        userNameDisplayId,
        guestNameContainerId
    } = options;

    if (!scriptUrl || !pageId || !formId || !commentInputId || !listContainerId || !loadingIndicatorId) {
        console.error("Comment System Error: Missing one or more required option parameters (scriptUrl, pageId, formId, commentInputId, listContainerId, loadingIndicatorId).");
        return;
    }

    // --- Get DOM elements ---
    const form = document.getElementById(formId);
    const listContainer = document.getElementById(listContainerId);
    const loadingIndicator = document.getElementById(loadingIndicatorId);
    const commentBodyInput = document.getElementById(commentInputId);
    const commentCountSpan = commentCountId ? document.getElementById(commentCountId) : null;

    if (!form || !listContainer || !loadingIndicator || !commentBodyInput) {
        console.error("Comment System Error: One or more DOM elements could not be found. Check your IDs.");
        return;
    }
    
    /**
     * Sanitizes a string to prevent XSS attacks.
     * @param {string} str - The input string to sanitize.
     * @returns {string} The sanitized string.
     */
    function escapeHTML(str) {
        if (typeof str !== 'string') return '';
        return str.replace(/[&<>'"]/g,
            tag => ({
                '&': '&',
                '<': '<',
                '>': '>',
                "'": ''',
                '"': '"'
            }[tag] || tag)
        );
    }

    /**
     * Fetches and displays comments for the current pageId.
     */
    async function loadComments() {
        listContainer.innerHTML = '';
        if (loadingIndicator) loadingIndicator.style.display = 'block';
        if (commentCountSpan) commentCountSpan.textContent = '0';

        try {
            const response = await fetch(`${scriptUrl}?pageIdentifier=${encodeURIComponent(pageId)}`);
            if (!response.ok) throw new Error(`Network response was not ok (${response.status})`);
            
            const comments = await response.json();

            if (Array.isArray(comments)) {
                if (commentCountSpan) commentCountSpan.textContent = comments.length;
                
                if (comments.length === 0) {
                    listContainer.innerHTML = '<p class="text-muted small">មិនទាន់មានមតិយោបល់នៅឡើយទេ។</p>';
                } else {
                    comments.forEach(item => {
                        const commentEl = document.createElement('div');
                        commentEl.className = 'comment-item border-bottom pb-2 mb-2';
                        // Format date to a more readable locale string.
                        const commentDate = new Date(item.timestamp).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });

                        commentEl.innerHTML = `
                            <p class="mb-1">
                                <strong class="comment-author">${escapeHTML(item.name)}</strong>
                                <small class="comment-date text-muted ms-2">${commentDate}</small>
                            </p>
                            <p class="comment-text mb-0 small">${escapeHTML(item.comment).replace(/\n/g, '<br>')}</p>
                        `;
                        listContainer.appendChild(commentEl);
                    });
                }
            } else {
                 throw new Error("Invalid data format received from server.");
            }

        } catch (error) {
            console.error('Error loading comments:', error);
            listContainer.innerHTML = `<p class="text-danger small">មិនអាចផ្ទុកមតិយោបល់បានទេ: ${error.message}</p>`;
        } finally {
            if (loadingIndicator) loadingIndicator.style.display = 'none';
        }
    }

    /**
     * Handles the submission of the comment form.
     * @param {Event} event - The form submission event.
     */
    async function handleCommentSubmit(event) {
        event.preventDefault();
        const submitButton = form.querySelector('button[type="submit"]');
        if (!submitButton) return;

        let userName;
        const commentBody = commentBodyInput.value.trim();

        // Determine user's name
        if (userProfile && userProfile.name) {
            userName = userProfile.name;
        } else {
            const guestNameInput = document.getElementById(guestNameInputId);
            if (!guestNameInput) {
                 alert('កំហុស៖ រកមិនឃើញវាលសម្រាប់ការបញ្ចូលឈ្មោះ');
                 return;
            }
            userName = guestNameInput.value.trim();
        }

        // Basic validation
        if (!userName || !commentBody) {
            alert('សូមបញ្ចូលឈ្មោះ និងមតិយោបល់');
            return;
        }

        const originalButtonText = submitButton.innerHTML;
        submitButton.disabled = true;
        submitButton.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>កំពុងផ្ញើ...`;

        try {
            const response = await fetch(scriptUrl, {
                method: 'POST',
                // Apps Script with doPost requires a plain text body for JSON.parse()
                body: JSON.stringify({
                    name: userName,
                    comment: commentBody,
                    pageIdentifier: pageId
                }),
                headers: { "Content-Type": "text/plain;charset=utf-8" },
            });

            const result = await response.json();
            if (result.status !== 'success') {
                throw new Error(result.message || 'Unknown error occurred during submission.');
            }

            // Clear input fields
            commentBodyInput.value = '';
            if (guestNameInputId && !userProfile) {
                document.getElementById(guestNameInputId).value = '';
            }

            // Reload comments to show the new one
            await loadComments();

        } catch (error) {
            console.error('Error submitting comment:', error);
            alert(`មានកំហុសក្នុងការផ្ញើមតិរបស់អ្នក ${error.message}`);
        } finally {
            submitButton.disabled = false;
            submitButton.innerHTML = originalButtonText;
        }
    }

    /**
     * Updates the comment form UI based on user login status.
     */
    function updateFormUI() {
        // This part is only relevant if the UI needs to change for logged-in users.
        if (!userInfoContainerId || !guestNameContainerId || !userNameDisplayId || !guestNameInputId) {
            return; // Not enough info to update UI, assume it's static.
        }
        
        const userInfoDiv = document.getElementById(userInfoContainerId);
        const userNameSpan = document.getElementById(userNameDisplayId);
        const guestNameDiv = document.getElementById(guestNameContainerId);
        const guestNameInput = document.getElementById(guestNameInputId);

        if (!userInfoDiv || !userNameSpan || !guestNameDiv || !guestNameInput) {
            console.warn("Comment System Warning: Could not find all UI elements for user/guest display. Check your IDs.");
            return;
        }

        if (userProfile && userProfile.name) {
            // User is logged in
            userNameSpan.textContent = userProfile.name;
            userInfoDiv.style.display = 'block';
            guestNameDiv.style.display = 'none';
            guestNameInput.required = false;
        } else {
            // User is a guest
            userInfoDiv.style.display = 'none';
            guestNameDiv.style.display = 'block';
            guestNameInput.required = true;
        }
    }

    // --- Initialization ---
    form.addEventListener('submit', handleCommentSubmit);
    updateFormUI(); // Set up the form UI based on initial login state
    loadComments(); // Initial load of comments
}
