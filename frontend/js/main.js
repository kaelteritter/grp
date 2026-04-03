// Initialize the app based on current page
document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;
    
    console.log('Current path:', path);
    
    if (path.match(/^\/profiles\/\d+$/)) {
        // Profile detail page (e.g., /profiles/3)
        console.log('Loading profile page');
        if (typeof profilePage !== 'undefined') {
            profilePage.init();
        } else {
            console.error('profilePage is not defined');
        }
    } else if (path === '/profiles' || path === '/profiles/all' || path === '/profiles/') {
        // Profiles list page
        console.log('Loading profiles page');
        if (typeof profilesPage !== 'undefined') {
            profilesPage.init();
        } else {
            console.error('profilesPage is not defined');
        }
    } else if (path === '/' || path === '') {
        // Redirect to profiles
        window.location.href = '/profiles';
    } else {
        console.log('Unknown path:', path);
    }
});