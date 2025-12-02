document.addEventListener('DOMContentLoaded', () => {
    const page = document.getElementById("page");

    const footerButtons = document.getElementsByClassName("footer-button");

    Array.from(footerButtons).forEach(button => {
        const pageToLoad = button.classList[0];
        if (pageToLoad) {
            button.addEventListener('click', () => switchPage(pageToLoad));
        }
    });

    function switchPage(pageName) {
        if (!page.src.endsWith(`${pageName}.html`)) {
            page.src = `${pageName}.html`;
        }
    }
});