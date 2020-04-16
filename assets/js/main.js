if (document.readyState !== 'loading') {
	viewportHeightFix();
	init();
} else {
	document.addEventListener('DOMContentLoaded', function() {
		viewportHeightFix();
		init();
	});
}

function init(){

	var pausePoints = [0, 6.92, 12.16, 14.88, 21.84, 29.16, 33.12, 37.72, 43.2, 45.04, 51.24, 53.24, 54.48, 55.96, 58.36, 63.16, 69.88, 76.16, 87];

	var navigationMap = [0, 1, 3, 7, 9, 10, 14, 16, 17];

	var analyticsLabels = ['Overview', 'Design', 'Design 2', 'Performance', 'Engine', 'Wheels & Brakes', 'Interior', 'Technology', 'Gazoo Racing'];

	var currentTime = 0, sceneNumber = 0, timeline = false, transitionLocked = false, introActive = false,
		$buttonStart = document.getElementById('intro-start'),
		$buttonReserve = document.getElementById('intro-reserve'),
		$buttonContinue = document.getElementById('intro-continue'),
		$buttonRestart = document.getElementById('intro-restart'),
		$intro = document.getElementById('intro-wrapper'),
		$scenes = document.querySelectorAll('.scenes-wrapper .scene-wrapper'),
		$scenesWrapper = document.getElementById('scenes-wrapper'),
		$placeholder = document.getElementById('scenes-placeholder'),
		$navigation = document.querySelectorAll('.intro-nav-panel .intro-nav-item'),
		$animSelector = '.intro-label, .intro-heading, .intro-text, .sound-btn, .anim-item',
		$animItems = document.querySelectorAll($animSelector),
		$startOverlay = document.getElementById('start-overlay'),
		$videos = document.querySelectorAll('.video-wrapper .bg-video'),
		$videoMobile = document.getElementById('mobile-video'),
		$videoDesktop = document.getElementById('desktop-video'),
		$video = $videoDesktop,
		$audio = document.getElementById('bg-audio'),
		$videoMobilePlaceholder = document.getElementById('mobile-placeholder-video'),
		$videoDesktopPlaceholder = document.getElementById('desktop-placeholder-video'),
		$videoPlaceholder = $videoDesktopPlaceholder,
		fadeInFromOptions = {
			y: 100,
			autoAlpha: 0
		},
		fadeInToOptions = {
			y: 0,
			autoAlpha: 1,
			ease: Circ.easeOut
		},
		fadeOutFromOptions = {
			y: 0,
			autoAlpha: 1,
			delay: 0
		},
		fadeOutToOptions = {
			y: -100,
			ease: Circ.easeIn,
			autoAlpha: 0,
			delay: 0
		};


	// Trigger placeholder animation

	window.addEventListener('load', function() {

		resizeVideo();

		$videoPlaceholder.play();

		$videoMobilePlaceholder.addEventListener('ended', function() {
			$placeholder.classList.remove('placeholder-hidden');
			$videoMobilePlaceholder.currentTime = $videoMobilePlaceholder.duration;
		});

		$videoDesktopPlaceholder.addEventListener('ended', function(e) {
			$placeholder.classList.remove('placeholder-hidden');
			$videoDesktopPlaceholder.currentTime = $videoDesktopPlaceholder.duration;
		});

	});


	// Start all the animation on a button click

	$buttonStart.addEventListener('click', function(){

		$scenesWrapper.classList.remove('scenes-hidden');

		startIntro();

		triggerAnalyticsEvent('gaClick', 'Supra Immersive Hero Banner Buttons', $buttonStart.innerText, '');

	});


	// Attach event to restart button

	$buttonRestart.addEventListener('touchend', function(e){

		e.preventDefault();

		if($buttonRestart.classList.contains('expand')) {

			startIntro();

			triggerAnalyticsEvent('gaClick', 'Supra Immersive Restart Buttons', 'Restart experience', '');

		} else {

			$buttonRestart.classList.add('expand');

		}

	});

	$buttonRestart.addEventListener('click', function(e){
		startIntro();
	});
	
	$buttonRestart.addEventListener('mouseover', function(e){
		$buttonRestart.classList.add('expand');
		$buttonRestart.classList.remove('close');
	});

	$buttonRestart.addEventListener('mouseleave', function(e){
		$buttonRestart.classList.remove('expand');
		$buttonRestart.classList.add('close');
	});


	// Start all the animation on a placeholder click

	$placeholder.addEventListener('click', function(e){

		if (e.target === $placeholder && document.documentElement.clientWidth < 768) {

			startIntro();

			triggerAnalyticsEvent('gaClick', 'Supra Immersive Hero Banner Buttons', $buttonStart.innerText, '');

		}

		if (e.target !== $buttonReserve) {
			e.stopPropagation();
		}

	});


	// Trigger an Google Analytics event on a button click

	$buttonReserve.addEventListener('click', function(e) {

		triggerAnalyticsEvent('gaClick', 'Supra Immersive Hero Banner Buttons', $buttonReserve.innerText, '');

		unlockScroll();

	});


	// Scroll to other contents at the end

	$buttonContinue.addEventListener('click', function(e) {

		unlockScroll();

	});


	// Bind all the evetns to handle the intro switching

	(function(window, document) {

		$videoMobile.addEventListener('timeupdate', videoWatchAndPause);
		$videoDesktop.addEventListener('timeupdate', videoWatchAndPause);

		window.addEventListener('resize', resizeVideo);
		window.addEventListener('orientationchange', resizeVideo);

		document.addEventListener('wheel', handleWheel);
		document.addEventListener('touchstart', handleTouchStart);
		document.addEventListener('touchmove', handleTouchMove);
		document.addEventListener('touchend', handleTouchEnd);
		document.addEventListener('keyup', handleKeyPress);

		[].forEach.call($navigation, function(el, index) {

			if (typeof navigationMap[index] !== 'undefined') {

				el.addEventListener('click', function(e) {

					goToScene(navigationMap[index], true);

					if (typeof analyticsLabels[index] !== 'undefined') {
						triggerAnalyticsClick(analyticsLabels[index] + ' Click');
					}

				});

				el.addEventListener('mouseover', function() {
					el.classList.add('intro-dot-hovered');
				});

				el.addEventListener('mouseleave', function() {
					el.classList.remove('intro-dot-hovered');
				});

				el.addEventListener('touchend', function() {

					setTimeout(function() {
						[].forEach.call($navigation, function(el) {
							el.classList.remove('intro-dot-hovered');
						});
					}, 1500);

				});

			}

		});

		[].forEach.call(document.getElementsByClassName('sound-btn'), function(el, index) {

			el.addEventListener('mouseover', function() {
				el.classList.add('sound-btn-active');
			});

			el.addEventListener('mouseleave', function() {
				el.classList.remove('sound-btn-active');
			});

			el.addEventListener('click', function(e) {

				if ($audio.paused === true) {
					$audio.play();
				} else {
					$audio.pause();
				}

				el.classList.remove('sound-btn-active');

			});

		});

		var xDown = null;
		var yDown = null;
		var xDiff = null;
		var yDiff = null;
		var timeDown = null;
		var startEl = null;

		function handleTouchEnd(e) {

			if (startEl !== e.target) return;

			var swipeThreshold = parseInt(startEl.getAttribute('data-swipe-threshold') || '20', 10);
			var swipeTimeout = parseInt(startEl.getAttribute('data-swipe-timeout') || '500', 10);
			var timeDiff = Date.now() - timeDown;
			var eventType = false;

			if (Math.abs(xDiff) > Math.abs(yDiff)) {
				if (Math.abs(xDiff) > swipeThreshold && timeDiff < swipeTimeout) {
					if (xDiff > 0) {
						eventType = 'swiped-left';
					} else {
						eventType = 'swiped-right';
					}
				}
			} else {
				if (Math.abs(yDiff) > swipeThreshold && timeDiff < swipeTimeout) {
					if (yDiff > 0) {
						eventType = 'swiped-up';
					} else {
						eventType = 'swiped-down';
					}
				}
			}

			if (eventType) {

				if (eventType === 'swiped-up' || eventType === 'swiped-left') {
					goToNextScene();
				} else if (eventType === 'swiped-down' || eventType === 'swiped-right') {
					goToPrevScene();
				}

			}

			xDown = null;
			yDown = null;
			timeDown = null;

		}

		function handleTouchStart(e) {
			startEl = e.target;
			timeDown = Date.now();
			xDown = e.touches[0].clientX;
			yDown = e.touches[0].clientY;
			xDiff = 0;
			yDiff = 0;
		}

		function handleTouchMove(e) {
			if (!xDown || !yDown) return;
			var xUp = e.touches[0].clientX;
			var yUp = e.touches[0].clientY;
			xDiff = xDown - xUp;
			yDiff = yDown - yUp;
		}

		function handleKeyPress(e) {

			var code = e.keyCode;

			if (code === 38 || code === 33 || code === 8) {
				goToPrevScene(true);
			}

			if (code === 40 || code === 34 || code === 32) {
				goToNextScene(true);
			}

		}

		function handleWheel(e) {

			var delta = e.deltaY || e.detail || e.wheelDelta;

			if (delta < 0) {
				goToPrevScene();
			}

			if (delta > 0) {
				goToNextScene();
			}

		}

	}(window, document));


	// Start the intro playback

	function startIntro() {

		$videoMobilePlaceholder.pause();

		$videoDesktopPlaceholder.pause();

		$intro.classList.remove('intro-hidden');

		goToScene(0);

		resizeVideo();

	}


	// Resize background videos according to the current viewport dimensions

	function resizeVideo() {

		setVideo();

		var dimensions = $intro.getBoundingClientRect(),
			height = dimensions.height,
			width = dimensions.width,
			ratio = 9 / 16;

		if ((document.documentElement.clientHeight > document.documentElement.clientWidth)) {
			ratio = 16 / 9;
		}

		if (width > 0 && height > 0) {

			$intro.classList.add('video-centered');

			if (height/width > ratio) {
				width = Math.round(height / ratio) + 'px';
				height = height + 'px';
			} else {
				height = Math.round(width * ratio) + 'px';
				width = width + 'px';
			}

			for (var i = 0; i < $videos.length; i++) {
				$videos[i].style.width = width;
				$videos[i].style.height = height;
			}

		}

	}


	// Select the current background video according to the device orientation

	function setVideo() {

		var style = window.getComputedStyle($videoDesktop, null),
			pausedPlaceholder = $videoPlaceholder.paused,
			timePlaceholder = $videoPlaceholder.currentTime,
			paused = $video.paused,
			time = $video.currentTime;

		if (style.display === 'block') { // switch to landscape
			$videoDesktop.currentTime = time;
			if (!paused) {
				$videoMobile.pause();
				$videoDesktop.play();
			}
			$video = $videoDesktop;

			$videoDesktopPlaceholder.currentTime = timePlaceholder;
			if (!pausedPlaceholder) {
				$videoMobilePlaceholder.pause();
				$videoDesktopPlaceholder.play();
			}
			$videoPlaceholder = $videoDesktopPlaceholder;

		} else { // switch to portrait
			$videoMobile.currentTime = time;
			if (!paused) {
				$videoDesktop.pause();
				
				$videoMobile.play();
			}
			$video = $videoMobile;
			
			$videoMobilePlaceholder.currentTime = timePlaceholder;
			if (!pausedPlaceholder) {
				$videoDesktopPlaceholder.pause();
				
				$videoMobilePlaceholder.play();
			}
			$videoPlaceholder = $videoMobilePlaceholder;

		}

	}


	// Add an active class to the navigation dot

	function selectDotItem(index) {

		if (typeof $navigation[index] !== 'undefined') {

			[].forEach.call($navigation, function(el) {
				el.classList.remove('intro-dot-active');
			});

			$navigation[index].classList.add('intro-dot-active');

			if (typeof analyticsLabels[index] !== 'undefined' && navigationMap.indexOf(sceneNumber) !== -1) {
				triggerAnalyticsView(analyticsLabels[index]);
			}

		}

	}


	// Scene management functions

	function startCurrentScene(showPrevious) {

		if ($scenes[sceneNumber]) {

			var index = 0, delay = 0;

			var $elements_next = $scenes[sceneNumber].querySelectorAll($animSelector);

			var $elements_prev = false;

			for (var x = 0; x < $animItems.length; x++) {
				$animItems[x].style.opacity = 0;
			}

			for (x = 0; x < navigationMap.length; x++) {

				if (sceneNumber < navigationMap[x]) {
					index = x - 1;
					break;
				} else if (sceneNumber === navigationMap[x]) {
					index = x;
					break;
				}

			}

			[].forEach.call($scenes, function(el) {
				el.classList.remove('is-selected');
			});

			$scenes[sceneNumber].classList.add('is-selected');

			if (typeof pausePoints[sceneNumber + 1] !== 'undefined') {
				delay = pausePoints[sceneNumber + 1] - pausePoints[sceneNumber];
			}

			if (sceneNumber === pausePoints.length - 2) {
				delay = 5.5;
			}

			selectDotItem(index);

			if (sceneNumber > 0 && showPrevious) {
				$elements_prev = $scenes[sceneNumber - 1].querySelectorAll($animSelector);
				$elements_prev = [].slice.call($elements_prev, 0).reverse();
			}

			timeline = new TimelineMax();

			if ($elements_prev) {
				timeline.staggerFromTo($elements_prev, 0.6, fadeOutFromOptions, fadeOutToOptions, -0.1);
			}

			if ($elements_next) {
				timeline.staggerFromTo($elements_next, 0.6, fadeInFromOptions, fadeInToOptions, 0.1, delay);
			}

		}

	}

	function goToNextScene(force) {

		force = force || false;

		if ((!transitionLocked || force) && introActive && sceneNumber < pausePoints.length - 2) {

			sceneNumber++;

			if (sceneNumber >= 0 && sceneNumber < pausePoints.length) {
				goToScene(sceneNumber, false);
			}

		} else if((!transitionLocked || force) && introActive && sceneNumber == pausePoints.length - 2) {
			
			sceneNumber++;

			unlockScroll(false);

		}

	}

	function goToPrevScene(force) {

		force = force || false;

		if ((!transitionLocked || force) && introActive && sceneNumber > 0) {

			sceneNumber--;

			goToScene(sceneNumber, true);

		}

	}

	function goToScene(sceneIndex, activateOverlay) {

		if (typeof pausePoints[sceneIndex] !== 'undefined') {

			lockScroll();

			pauseVideo();

			$audio.pause();

			$audio.currentTime = 0;

			[].forEach.call(document.getElementsByClassName('sound-btn'), function(el) {
				el.classList.remove('sound-btn-active');
			});

			// Clear the restart button class

			$buttonRestart.classList.remove('expand');
			$buttonRestart.classList.remove('close');

			if (timeline) {
				TweenMax.killAll();
				timeline = false;
			}

			sceneNumber = sceneIndex;

			playVideo(pausePoints[sceneNumber]);

			startCurrentScene(!activateOverlay);

			if (activateOverlay) {
				$startOverlay.classList.add('overlay-active');
				TweenMax.fromTo($startOverlay, 0.6, {
					autoAlpha: 1
				}, {
					autoAlpha: 0,
					ease: Circ.easeIn,
					onComplete: function() {
						$startOverlay.classList.remove('overlay-active');
					}
				});
			}

		}

	}


	// Play the current video at the given time position

	function playVideo(timePosition) {

		if (Math.abs($video.currentTime - timePosition) >= 1) {
			$video.currentTime = timePosition;
		}

		if ($video.readyState === 0) {
			transitionLocked = false;
		} else {
			transitionLocked = true;
			$video.play();
		}

	}


	// Pause the current video

	function pauseVideo() {

		$video.pause();

		transitionLocked = false;

	}


	// Automatically pause the video on a scene end

	function videoWatchAndPause() {

		currentTime = this.currentTime;

		if (Math.abs(currentTime - pausePoints[sceneNumber + 1]) < 0.3) {

			pauseVideo();

		}

	}


	// Lock the scroll

	function lockScroll() {

		introActive = true;

		document.body.classList.add('intro-locked');

		window.scroll({
			top: 0,
			left: 0,
			behavior: 'smooth'
		});

	}


	// Unlock the scroll

	function unlockScroll(scrollDown) {

		introActive = false;

		document.body.classList.remove('intro-locked');

		if (typeof scrollDown === 'undefined') {
			scrollDown = true;
		}

		if (scrollDown) {

			var offset = $intro.getBoundingClientRect().bottom + document.documentElement.scrollTop;

			window.scroll({
				top: offset,
				left: 0,
				behavior: 'smooth'
			});

		} 
		
	}


	// Handle Google Analytics events

	function triggerAnalyticsEvent(type, category, action, label) {

		var event = {
			'event': type,
			'eventCategory': category,
			'eventAction': action,
			'eventLabel': label,
			'model': 'Supra'
		};

		if (typeof window.dataLayer === 'undefined') {
			window.dataLayer = [];
		}

		window.dataLayer.push(event);

	}

	function triggerAnalyticsView(label) {
		triggerAnalyticsEvent('Content View', 'Supra Immersive', label, label);
	}

	function triggerAnalyticsClick(label) {
		triggerAnalyticsEvent('gaClick', 'Supra Manual Navigation', label, label);
	}

}


// Fix an issue with screen height on mobile browsers

function viewportHeightFix() {
	var vh = document.documentElement.clientHeight * 0.01;
	document.documentElement.style.setProperty('--vh', vh + 'px');
}

window.addEventListener('resize', viewportHeightFix);
window.addEventListener('orientationchange', viewportHeightFix);