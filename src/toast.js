import Velocity from 'velocity-animate';
import Hammer from 'hammerjs';

let globalOptions = {};

const Toast = {
    show : function (message, options) {
        show(message, options);
    },
    success :  function (message, options) {
        options = options || {};
        options.type = "success";
        show(message, options);
    },
    info :  function (message, options) {
        options = options || {};
        options.type = "info";
        show(message, options);
    },
    error :  function (message, options) {
        options = options || {};
        options.type = "error";
        show(message, options);
    },
    setGlobalOptions : function (options) {
        globalOptions = options || {};
    }
};


const show = function (message, options) {
    options = options || {};

    // merge global options with options
    Object.assign(options, globalOptions);

    // class name to be added on the toast
    options.className = options.className || "primary";

    // complete call back of the toast
    options.onComplete = options.onComplete || null;

    // toast position
    options.position = options.position || "top-right";

    // toast duration
    options.duration = options.duration || null;

    // normal type will allow the basic color
    options.type = options.type || null;

    let completeCallback = options.onComplete;
    let className = options.className;
    let displayLength = options.duration;

    // Add Type class to the class name list
    if(options.type) {
        className = options.className + " " + options.type.trim()
    }

    let container = document.getElementById('toast-container');

    // Create toast container if it does not exist
    if (container === null) {
        // create notification container
        container = document.createElement('div');
        container.id = 'toast-container';
        container.classList.add(options.position);
        document.body.appendChild(container);
    }

    // Select and append toast
    let newToast = createToast(message);

    // only append toast if message is not undefined
    if (message) {
        container.appendChild(newToast);
    }

    newToast.style.opacity = 0;

    // Animate toast in
    Velocity(newToast, {translateY: '-35px', opacity: 1}, {
        duration: 300,
        easing: 'easeOutCubic',
        queue: false
    });

    // Allows timer to be pause while being panned
    var timeLeft = displayLength;
    var counterInterval;
    if (timeLeft != null) {
        counterInterval = setInterval(function () {
            if (newToast.parentNode === null)
                window.clearInterval(counterInterval);

            // If toast is not being dragged, decrease its time remaining
            if (!newToast.classList.contains('panning')) {
                timeLeft -= 20;
            }

            if (timeLeft <= 0) {
                // Animate toast out
                Velocity(newToast, {"opacity": 0, marginTop: '-40px'}, {
                    duration: 375,
                    easing: 'easeOutExpo',
                    queue: false,
                    complete: function () {
                        // Call the optional callback
                        if (typeof(completeCallback) === "function")
                            completeCallback();
                        // Remove toast after it times out
                        this[0].parentNode.removeChild(this[0]);
                    }
                });
                window.clearInterval(counterInterval);
            }
        }, 20);
    }


    function createToast(html) {

        // Create toast
        var toast = document.createElement('div');
        toast.classList.add('toast');
        if (className) {
            var classes = className.split(' ');

            for (var i = 0, count = classes.length; i < count; i++) {
                toast.classList.add(classes[i]);
            }
        }
        // If type of parameter is HTML Element
        if (typeof HTMLElement === "object" ? html instanceof HTMLElement : html && typeof html === "object" && html !== null && html.nodeType === 1 && typeof html.nodeName === "string"
        ) {
            toast.appendChild(html);
        }
        else {
            // Insert as text;
            toast.innerHTML = html;
        }

        // Bind hammer
        var hammerHandler = new Hammer(toast, {prevent_default: false});
        hammerHandler.on('pan', function (e) {
            var deltaX = e.deltaX;
            var activationDistance = 80;

            // Change toast state
            if (!toast.classList.contains('panning')) {
                toast.classList.add('panning');
            }

            var opacityPercent = 1 - Math.abs(deltaX / activationDistance);
            if (opacityPercent < 0)
                opacityPercent = 0;

            Velocity(toast, {left: deltaX, opacity: opacityPercent}, {duration: 50, queue: false, easing: 'easeOutQuad'});

        });

        hammerHandler.on('panend', function (e) {
            var deltaX = e.deltaX;
            var activationDistance = 80;

            // If toast dragged past activation point
            if (Math.abs(deltaX) > activationDistance) {
                Velocity(toast, {marginTop: '-40px'}, {
                    duration: 375,
                    easing: 'easeOutExpo',
                    queue: false,
                    complete: function () {
                        if (typeof(completeCallback) === "function") {
                            completeCallback();
                        }
                        toast.parentNode.removeChild(toast);
                    }
                });

            } else {
                toast.classList.remove('panning');
                // Put toast back into original position
                Velocity(toast, {left: 0, opacity: 1}, {
                    duration: 300,
                    easing: 'easeOutExpo',
                    queue: false
                });

            }
        });

        return toast;
    }
};

export default Toast;