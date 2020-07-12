"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
console.group(`sidebar/index.js`);
const bhe_1 = require("./bhe");
exports.Sidebar = new class extends bhe_1.Div {
    constructor() {
        super({
            byid: 'sidebar', children: { items: '<div>' }
        });
        this.items.forEach(item => {
            item.click(() => {
                this.select(item);
            });
        });
    }
    select(item) {
        let _is_selected;
        if (typeof item === 'string') {
            _is_selected = (a) => a.hasClass(item);
        }
        else {
            _is_selected = (a) => a === item;
        }
        for (let _item of this.items) {
            let is_selected = _is_selected(_item);
            _item.toggleClass('selected', is_selected);
            _item.toggleClass('unclickable', is_selected);
        }
    }
};
console.log('sidebar/index.js EOF');
console.groupEnd();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2lkZWJhci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInNpZGViYXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFHQSxPQUFPLENBQUMsS0FBSyxDQUFDLGtCQUFrQixDQUFDLENBQUM7QUFDbEMsK0JBQStDO0FBSWxDLFFBQUEsT0FBTyxHQUFHLElBQUksS0FBTSxTQUFRLFNBQUc7SUFHeEM7UUFDSSxLQUFLLENBQUM7WUFDRixJQUFJLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUU7U0FDaEQsQ0FBQyxDQUFDO1FBQ0gsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDdEIsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUU7Z0JBQ1osSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQTtZQUNyQixDQUFDLENBQUMsQ0FBQTtRQUNOLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVELE1BQU0sQ0FBQyxJQUFJO1FBQ1AsSUFBSSxZQUFZLENBQUM7UUFDakIsSUFBSSxPQUFPLElBQUksS0FBSyxRQUFRLEVBQUU7WUFDMUIsWUFBWSxHQUFHLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQzFDO2FBQU07WUFDSCxZQUFZLEdBQUcsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsS0FBSyxJQUFJLENBQUM7U0FFcEM7UUFDRCxLQUFLLElBQUksS0FBSyxJQUFJLElBQUksQ0FBQyxLQUFLLEVBQUU7WUFDMUIsSUFBSSxXQUFXLEdBQUcsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3RDLEtBQUssQ0FBQyxXQUFXLENBQUMsVUFBVSxFQUFFLFdBQVcsQ0FBQyxDQUFDO1lBQzNDLEtBQUssQ0FBQyxXQUFXLENBQUMsYUFBYSxFQUFFLFdBQVcsQ0FBQyxDQUFDO1NBQ2pEO0lBQ0wsQ0FBQztDQUVKLENBQUM7QUE0RUYsT0FBTyxDQUFDLEdBQUcsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO0FBQ3BDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8vICoqIHNpZGViYXIvaW5kZXguanNcblxuXG5jb25zb2xlLmdyb3VwKGBzaWRlYmFyL2luZGV4LmpzYCk7XG5pbXBvcnQgeyBCZXR0ZXJIVE1MRWxlbWVudCwgRGl2IH0gZnJvbSBcIi4vYmhlXCI7XG4vLyBpbXBvcnQgKiBhcyBQYWdlcyBmcm9tIFwiLi9wYWdlcy9wYWdlcy5qc1wiXG5cblxuZXhwb3J0IGNvbnN0IFNpZGViYXIgPSBuZXcgY2xhc3MgZXh0ZW5kcyBEaXYge1xuICAgIGl0ZW1zOiBCZXR0ZXJIVE1MRWxlbWVudFtdO1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKHtcbiAgICAgICAgICAgIGJ5aWQ6ICdzaWRlYmFyJywgY2hpbGRyZW46IHsgaXRlbXM6ICc8ZGl2PicgfVxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5pdGVtcy5mb3JFYWNoKGl0ZW0gPT4ge1xuICAgICAgICAgICAgaXRlbS5jbGljaygoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3QoaXRlbSlcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHNlbGVjdChpdGVtKSB7XG4gICAgICAgIGxldCBfaXNfc2VsZWN0ZWQ7XG4gICAgICAgIGlmICh0eXBlb2YgaXRlbSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIF9pc19zZWxlY3RlZCA9IChhKSA9PiBhLmhhc0NsYXNzKGl0ZW0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgX2lzX3NlbGVjdGVkID0gKGEpID0+IGEgPT09IGl0ZW07XG5cbiAgICAgICAgfVxuICAgICAgICBmb3IgKGxldCBfaXRlbSBvZiB0aGlzLml0ZW1zKSB7XG4gICAgICAgICAgICBsZXQgaXNfc2VsZWN0ZWQgPSBfaXNfc2VsZWN0ZWQoX2l0ZW0pO1xuICAgICAgICAgICAgX2l0ZW0udG9nZ2xlQ2xhc3MoJ3NlbGVjdGVkJywgaXNfc2VsZWN0ZWQpO1xuICAgICAgICAgICAgX2l0ZW0udG9nZ2xlQ2xhc3MoJ3VuY2xpY2thYmxlJywgaXNfc2VsZWN0ZWQpO1xuICAgICAgICB9XG4gICAgfVxuXG59O1xuXG4vLyBjb25zdCBQYWdlcyA9IHJlcXVpcmUoXCJweWFub19sb2NhbF9tb2R1bGVzL3BhZ2VzL3BhZ2VzXCIpO1xuXG4vLyAvKipAdHlwZWRlZiB7J3NpZGViYXJfaW5zaWRlX3Rlc3QnIHwgJ3NpZGViYXJfZmlsZV90b29scycgfCAnc2lkZWJhcl9zZXR0aW5ncycgfCAnc2lkZWJhcl9uZXdfdGVzdCcgfCAnc2lkZWJhcl9leGFtJyB8ICdzaWRlYmFyX3JlY29yZCd9IFRTaWRlYmFySWQqL1xuXG4vLyAvKipAcGFyYW0ge1RTaWRlYmFySWR9IHRhcmdldElkXG4vLyAgKiBAcGFyYW0ge2Jvb2xlYW59IGNoYW5nZVRpdGxlKi9cbi8qXG5mdW5jdGlvbiBfc2VsZWN0U2lkZWJhckl0ZW0odGFyZ2V0SWQsIHsgY2hhbmdlVGl0bGUgfSkge1xuICAgIGxldCBodG1sO1xuICAgIGZvciAobGV0IHNpZGViYXJJdGVtIG9mIFNpZGViYXIuaXRlbXMpIHtcbiAgICAgICAgaWYgKHNpZGViYXJJdGVtLmlkID09IHRhcmdldElkKSB7XG4gICAgICAgICAgICBodG1sID0gc2lkZWJhckl0ZW0uaW5uZXJIVE1MO1xuICAgICAgICAgICAgJChzaWRlYmFySXRlbSkuYWRkQ2xhc3MoXCJzZWxlY3RlZFwiKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICQoc2lkZWJhckl0ZW0pLnJlbW92ZUNsYXNzKFwic2VsZWN0ZWRcIik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKGNoYW5nZVRpdGxlKSB7XG4gICAgICAgICRUaXRsZS5odG1sKGh0bWwudGl0bGUoKSk7XG4gICAgfVxuXG5cbn1cbiovXG5cbi8qZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkKCkge1xuICAgIGNvbnN0ICRzaWRlYmFySXRlbXMgPSBbXTtcbiAgICBjb25zdCBzaWRlYmFyRGljdCA9IHtcbiAgICAgICAgbmV3X3Rlc3Q6IFwiTmV3IEV4cGVyaW1lbnRcIixcbiAgICAgICAgcmVjb3JkOiAnUmVjb3JkJyxcbiAgICAgICAgZmlsZV90b29sczogJ0ZpbGUgVG9vbHMnLFxuICAgICAgICBzZXR0aW5nczogXCJTZXR0aW5nc1wiLFxuICAgIH07XG4gICAgZm9yIChsZXQgWyBpLCBbIGVpZCwgaHVtYW4gXSBdIG9mIHV0aWwuZW51bWVyYXRlKE9iamVjdC5lbnRyaWVzKHNpZGViYXJEaWN0KSkpIHtcblxuICAgICAgICBjb25zdCBncmlkUm93ID0gKGkgKyAxKS50b1N0cmluZygpO1xuICAgICAgICBjb25zdCBpZCA9IGBzaWRlYmFyXyR7ZWlkfWA7XG4gICAgICAgICRzaWRlYmFySXRlbXMucHVzaChzcGFuKHsgY2xzOiBodW1hbiB9KVxuICAgICAgICAgICAgLmFkZENsYXNzKGBzaWRlYmFyLWl0ZW1gKVxuICAgICAgICAgICAgLmF0dHIoXCJpZFwiLCBpZClcbiAgICAgICAgICAgIC5jc3MoeyBncmlkUm93OiBgJHtncmlkUm93fS8ke2dyaWRSb3d9YCB9KVxuICAgICAgICAgICAgLmNsaWNrKCgpID0+IFBhZ2VzLnRvUGFnZShlaWQsIHRydWUpKVxuICAgICAgICApO1xuXG5cbiAgICB9XG5cbiAgICAkU2lkZWJhci5hcHBlbmQoJHNpZGViYXJJdGVtcyk7XG59Ki9cblxuXG4vLyBleHBvcnQgZnVuY3Rpb24gdG9faW5zaWRlX3Rlc3QoKSB7XG4vLyAgICAgX3NlbGVjdFNpZGViYXJJdGVtKCdzaWRlYmFyX2luc2lkZV90ZXN0JywgeyBjaGFuZ2VUaXRsZTogZmFsc2UgfSk7XG4vLyB9XG4vL1xuLy8gZXhwb3J0IGZ1bmN0aW9uIHRvX2ZpbGVfdG9vbHMoKSB7XG4vLyAgICAgX3NlbGVjdFNpZGViYXJJdGVtKCdzaWRlYmFyX2ZpbGVfdG9vbHMnLCB7IGNoYW5nZVRpdGxlOiB0cnVlIH0pO1xuLy8gfVxuLy9cbi8vIGV4cG9ydCBmdW5jdGlvbiB0b19zZXR0aW5ncygpIHtcbi8vICAgICBfc2VsZWN0U2lkZWJhckl0ZW0oJ3NpZGViYXJfc2V0dGluZ3MnLCB7IGNoYW5nZVRpdGxlOiB0cnVlIH0pO1xuLy8gfVxuLy9cbi8vIGV4cG9ydCBmdW5jdGlvbiB0b19uZXdfdGVzdCgpIHtcbi8vICAgICBfc2VsZWN0U2lkZWJhckl0ZW0oJ3NpZGViYXJfbmV3X3Rlc3QnLCB7IGNoYW5nZVRpdGxlOiB0cnVlIH0pO1xuLy8gfVxuLy9cbi8vIGV4cG9ydCBmdW5jdGlvbiB0b19yZWNvcmQoKSB7XG4vLyAgICAgX3NlbGVjdFNpZGViYXJJdGVtKCdzaWRlYmFyX3JlY29yZCcsIHsgY2hhbmdlVGl0bGU6IHRydWUgfSk7XG4vLyB9XG5cbi8vIG1vZHVsZS5leHBvcnRzID0ge2J1aWxkLCB0b19yZWNvcmQsIHRvX25ld190ZXN0LCB0b19maWxlX3Rvb2xzLCB0b19zZXR0aW5ncywgdG9faW5zaWRlX3Rlc3R9O1xuXG5cbmNvbnNvbGUubG9nKCdzaWRlYmFyL2luZGV4LmpzIEVPRicpO1xuY29uc29sZS5ncm91cEVuZCgpOyJdfQ==