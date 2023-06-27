// activate slick on mobile devices 
$(document).ready(function() {
    function initSlick() {
        $('.potos_container').slick({
        speed: 300,
        arrows: true,
        infinite: true,
        });
    }

    function destroySlick() {
        if ($('.potos_container').hasClass('slick-initialized')) {
            $('.potos_container').slick('unslick');
        }
    }

    // Initialize or destroy Slick based on screen width
    function handleSlick() {
        if ($(window).width() < 768) {
        initSlick();
        } else {
        destroySlick();
        }
    }

    $(window).on('load resize', handleSlick);
});
    
