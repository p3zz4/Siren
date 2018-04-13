export function domElementCreator(elementName, parentElement = null, className = null, type = null) {
        const tmpElement = document.createElement(elementName);
        parentElement != null ? parentElement.appendChild(tmpElement) : null;
        className != null ? tmpElement.classList.add(className) : null;
        type != null ? tmpElement.type = type : null;
        return tmpElement;
}