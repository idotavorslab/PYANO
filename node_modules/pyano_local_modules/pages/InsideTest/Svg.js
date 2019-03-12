const base = `<svg>
 <rect class="piano-white-rect"/>
</svg>
`;
const blackRight = `<svg>
 <rect class="piano-white-rect"/>
 <rect class="piano-black piano-black-right-rect"/>
</svg>
`;
const blackLeft = `<svg>
    <rect class="piano-white-rect"/>
    <rect class="piano-black piano-black-left-rect"/>
</svg>
`;
const blackBoth = `<svg>
    <rect class="piano-white-rect"/>
    <rect class="piano-black piano-black-left-rect"/>
    <rect class="piano-black piano-black-right-rect"/>
</svg>
`;

module.exports = { base, blackRight, blackBoth, blackLeft };
