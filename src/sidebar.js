// ** sidebar/index.js
let {span} = require("pyano_local_modules/util");
const Pages = require("pyano_local_modules/pages/pages");
let {$Sidebar, $Title} = require("pyano_local_modules/document");

/**@typedef {'sidebar_inside_test' | 'sidebar_file_tools' | 'sidebar_settings' | 'sidebar_new_test' | 'sidebar_exam' | 'sidebar_record'} TSidebarId*/

/**@param {TSidebarId} targetId
 * @param {boolean} changeTitle*/
function _selectSidebarItem(targetId, {changeTitle}) {
    let html;
    for (let sidebarItem of $Sidebar.children()) {
        if (sidebarItem.id == targetId) {
            html = sidebarItem.innerHTML;
            $(sidebarItem).addClass("selected");
        } else {
            $(sidebarItem).removeClass("selected");
        }
    }
    if (changeTitle)
        $Title.html(html.title());


}

export function build() {
    const $sidebarItems = [];
    const sidebarDict = {
        new_test: "New Experiment",
        record: 'Record',
        file_tools: 'File Tools',
        settings: "Settings",
    };
    for (let [i, [eid, human]] of enumerate(Object.entries(sidebarDict))) {

        const gridRow = str(i + 1);
        const id = `sidebar_${eid}`;
        $sidebarItems.push($(span(human))
            .addClass(`sidebar-item`)
            .attr("id", id)
            .css({gridRow: `${gridRow}/${gridRow}`})
            .click(() => Pages.toPage(eid, true))
        );


    }

    $Sidebar
        .append($sidebarItems);
}


export function to_inside_test() {
    _selectSidebarItem('sidebar_inside_test', {changeTitle: false});
}

export function to_file_tools() {
    _selectSidebarItem('sidebar_file_tools', {changeTitle: true});
}

export function to_settings() {
    _selectSidebarItem('sidebar_settings', {changeTitle: true});
}

export function to_new_test() {
    _selectSidebarItem('sidebar_new_test', {changeTitle: true});
}

export function to_record() {
    _selectSidebarItem('sidebar_record', {changeTitle: true});
}

// module.exports = {build, to_record, to_new_test, to_file_tools, to_settings, to_inside_test};


