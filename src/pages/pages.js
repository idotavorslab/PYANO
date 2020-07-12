"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
console.group(`pages/pages.js`);
const newtest_js_1 = require("./NewTest/newtest.js");
function toPage(page, reload = false) {
    switch (page) {
        case 'new_test':
            return newtest_js_1.default.switch(reload);
        default:
            console.error(`pages default, got: ${page}`);
    }
}
exports.toPage = toPage;
console.log('pages/pages.js EOF');
console.groupEnd();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFnZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJwYWdlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLE9BQU8sQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztBQUNoQyxxREFBK0M7QUFZL0MsU0FBZ0IsTUFBTSxDQUFDLElBQWMsRUFBRSxTQUFrQixLQUFLO0lBQzFELFFBQVEsSUFBSSxFQUFFO1FBRVYsS0FBSyxVQUFVO1lBQ1gsT0FBTyxvQkFBVyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztRQU90QztZQUNJLE9BQU8sQ0FBQyxLQUFLLENBQUMsdUJBQXVCLElBQUksRUFBRSxDQUFDLENBQUM7S0FDcEQ7QUFDTCxDQUFDO0FBZEQsd0JBY0M7QUFFRCxPQUFPLENBQUMsR0FBRyxDQUFDLG9CQUFvQixDQUFDLENBQUM7QUFDbEMsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLy8gKiogcGFnZXMvcGFnZXMuanNcbmNvbnNvbGUuZ3JvdXAoYHBhZ2VzL3BhZ2VzLmpzYCk7XG5pbXBvcnQgbmV3VGVzdFBhZ2UgZnJvbSBcIi4vTmV3VGVzdC9uZXd0ZXN0LmpzXCI7XG5cbmltcG9ydCB7IExhc3RQYWdlIH0gZnJvbSBcIi4uL3RlbXBsYXRlcy9qcy90eXBlc1wiO1xuXG5cbi8vIGltcG9ydCAqIGFzIGluc2lkZVRlc3RQYWdlIGZyb20gXCIuL0luc2lkZVRlc3QvaW5zaWRldGVzdC5qc1wiO1xuLy9cbi8vIGltcG9ydCAqIGFzIHJlY29yZFBhZ2UgZnJvbSBcIi4vUmVjb3JkL3JlY29yZC5qc1wiO1xuLy9cbi8vIGltcG9ydCAqIGFzIGZpbGVUb29sc1BhZ2UgZnJvbSBcIi4vRmlsZVRvb2xzL2ZpbGV0b29scy5qc1wiO1xuXG5cbmV4cG9ydCBmdW5jdGlvbiB0b1BhZ2UocGFnZTogTGFzdFBhZ2UsIHJlbG9hZDogYm9vbGVhbiA9IGZhbHNlKSB7XG4gICAgc3dpdGNoIChwYWdlKSB7XG5cbiAgICAgICAgY2FzZSAnbmV3X3Rlc3QnOlxuICAgICAgICAgICAgcmV0dXJuIG5ld1Rlc3RQYWdlLnN3aXRjaChyZWxvYWQpO1xuICAgICAgICAvKmNhc2UgJ2luc2lkZV90ZXN0JzpcbiAgICAgICAgICAgIHJldHVybiBpbnNpZGVUZXN0UGFnZS5zd2l0Y2gocmVsb2FkKTtcbiAgICAgICAgY2FzZSAncmVjb3JkJzpcbiAgICAgICAgICAgIHJldHVybiByZWNvcmRQYWdlLnN3aXRjaChyZWxvYWQpO1xuICAgICAgICBjYXNlICdmaWxlX3Rvb2xzJzpcbiAgICAgICAgICAgIHJldHVybiBmaWxlVG9vbHNQYWdlLnN3aXRjaChyZWxvYWQpOyovXG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBwYWdlcyBkZWZhdWx0LCBnb3Q6ICR7cGFnZX1gKTtcbiAgICB9XG59XG5cbmNvbnNvbGUubG9nKCdwYWdlcy9wYWdlcy5qcyBFT0YnKTtcbmNvbnNvbGUuZ3JvdXBFbmQoKTtcbi8vIG1vZHVsZS5leHBvcnRzID0geyBuZXdUZXN0UGFnZSwgaW5zaWRlVGVzdFBhZ2UsIHJlY29yZFBhZ2UsIGZpbGVUb29sc1BhZ2UsIHRvUGFnZSB9O1xuIl19