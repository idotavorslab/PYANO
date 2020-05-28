// const $ = require("jquery");

const $PageCss = $('#page_css');
const $Sidebar = $('#sidebar');
const $Title = $('#title');
const $MainContent = $('#main_content').hide();
$Sidebar._fadeTo = $Sidebar.fadeTo;
$Sidebar.fadeTo = (speed, to, easing, callback) => {
	// [...$Sidebar[0].children].forEach(item=>item.classList.add('unclickable'));
	$Sidebar[0].classList.toggle('unclickable', to == 0);
	return $Sidebar._fadeTo(speed, to, easing, callback);
};

function safeSwitchCss(href) {
	if ($PageCss.attr('href') != href)
		$PageCss.attr('href', href);
}

/**
 * @type {{$Sidebar: jQuery, safeSwitchCss: safeSwitchCss, $MainContent: jQuery, $Title: jQuery}}
 */
module.exports = { $MainContent, $Sidebar, $Title, safeSwitchCss };
