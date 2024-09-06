const toggleCinema = () => {
    // find relevent elements for cinema mode
    const mainChild = document.getElementsByTagName('main')[0].children[0];
    const fwContainer = mainChild.children[0].children[0].children[0].children[0];
    const gridContainer = fwContainer.children[1].children[2].children[0];

    let homepageSection = document.getElementsByTagName('section');
    if (homepageSection?.length > 0) {
        homepageSection.item(0).children[0].classList.toggle('pcm-postcard-container-overrides');
    } else {
        try {
            fwContainer.classList.toggle('pcm-fixed-width-container-overrides');
            gridContainer.classList.toggle('pcm-grid-container-overrides');
        } catch (e) {
            console.error('PCM: Failed to expand video', e);
        }
    }

    const vid = document.getElementsByTagName('video')[0];

    // add override classes
    vid.classList.toggle('pcm-video-overrides');

    // update local storage flag
    const expanded = vid.classList.contains('pcm-video-overrides');
    chrome.storage.sync.set({'pcm-expanded': expanded});
    console.log('PCM: Set user settings in local storage', {'pcm-expanded': expanded});
};

const checkVideoPost = () => new Promise((resolve, reject) => {
  const titleElement = document.querySelectorAll('[data-tag="post-title"]')[0];
  // find relevent elements for cinema mode
  const mainChild = document.getElementsByTagName('main')[0].children[0];
  const fwContainer = mainChild.children[0].children[0].children[0].children[0];
  const gridContainer = fwContainer.children[1].children[2].children[0];
  let videoElement = gridContainer.getElementsByTagName('video')[0];

    if (!titleElement) return resolve(false);
    if (videoElement) return resolve(true);

    const videoCheck = setInterval(() => {
        videoElement = document.getElementsByTagName('video')[0];
        if (videoElement) {
            clearInterval(videoCheck);
            resolve(true);
        }
    }, 50);

    setTimeout(() => {
        clearInterval(videoCheck)
        resolve(false);
    }, 5000);
});

const docReady = onReady => {
    // see if DOM is already available
    if (document.readyState === "complete" || document.readyState === "interactive") {
        // call onReady next available tick
        setTimeout(onReady, 1000);
    } else {
        // add event listener for on load
        document.addEventListener("DOMContentLoaded", onReady);
    }
};

docReady(async () => {
    // check if loaded page is a video post
    const titleElement = document.querySelectorAll('[data-tag="post-title"]')[0];

    console.log('PCM: Running onReady');
    console.log('PCM: Checking if page is a video post');
    const isVideo = await checkVideoPost();
    if (isVideo) {
        // create button container
        const container = document.createElement('div');
        container.id = 'pcm-btn-container';
        titleElement.parentElement.append(container);

        // create cinema toggle button
        const expandButton = document.createElement('div');
        expandButton.id = 'pcm-expand-button';
        expandButton.title = 'Toggle cinema mode';
        container.append(expandButton);

        // add onClick handlers to button
        expandButton.addEventListener('click', toggleCinema);

        // on load, check pcm flags in local storage and toggle if required
        console.log('PCM: Getting user settings from local storage');
        chrome.storage.sync.get('pcm-expanded', store => {
            console.log('PCM: Got user settings from local storage', store);
            if (store['pcm-expanded']) {
                toggleCinema();
            }
        });
    }
});
