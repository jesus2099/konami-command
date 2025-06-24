// ==Bookmarklet==
// @name     Expand all Confluence Cloud sections
// @version  2025.2.5
// @author   jesus2099
// ==/Bookmarklet==

document.querySelectorAll("[data-node-type='expand']").forEach(function(node) {
	node.querySelector("button").click();
});
