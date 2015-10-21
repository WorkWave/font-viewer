var stylesheet;

addEventListener('load', function() {
    stylesheet = document.createElement('style');
    stylesheet.type = 'text/css';
    document.head.appendChild(stylesheet);
    document.querySelector('input[type=file]').addEventListener('change', readFont);

    document.querySelector('input[name=preview]').addEventListener('change', changePreview);

    var form = document.querySelector('form');

    form.addEventListener('change', function(changeEvent) {
        if(changeEvent.target.name == 'family')
            changeFontFamily(form.elements.namedItem('family').value);
    });
});

function changeFontFamily(family) {
    var previews = document.querySelectorAll('.preview');
    for(var i = 0; i < previews.length; i++)
        previews[i].style.fontFamily = family;
}

function changePreview(event) {
    var previews = document.querySelectorAll('.preview');
    for(var i = 0; i < previews.length; i++)
        previews[i].textContent = event.target.value;
}

function readFont(event) {
    for(var i = 0; i < event.target.files.length; i++) {
        var file = event.target.files[i];
        var reader = new FileReader();
        reader.addEventListener('load', fontRead.bind(this, file.name));
        reader.addEventListener('error', function(e) {alert(e);});
        reader.readAsDataURL(file);
    }

    event.target.value = null;
}

function createFontFamily(data, format, name) {
    stylesheet.textContent += "@font-face { font-family: '"+[name,format].join('-')+"'; src: url('"+data+"') format("+format+"); }\n";
    var label = document.createElement("label");
    var radio = document.createElement("input");
    radio.type = "radio";
    radio.name = "family";
    radio.value = [name,format].join('-');
    radio.checked = true;
    label.textContent = " "+name+" ("+format+")";
    label.insertBefore(radio, label.firstChild);
    document.querySelector('[data-radiogroup]').appendChild(label);
    changeFontFamily([name,format].join('-'));
}

function fontRead(filename, event) {
    var basename = filename.substring(0, filename.lastIndexOf('.'));
    var extension = filename.slice(filename.lastIndexOf('.') + 1);
    var dataURL = event.target.result;
    var type = dataURL.split(':')[1].split(',')[0];

    try {
        var format = guessFontFormat(type, extension);
        createFontFamily(dataURL, format, basename);
    } catch (e) {
        if(e instanceof UnrecognizedFontError)
            alert(e.message);
        else
            throw e;
    }
}

function guessFontFormat(type, extension) {
    var format = guessFontFormatByType(type) || guessFontFormatByExtension(extension);

    if(format)
        return format;

    function guessFontFormatByType(type) {
        if(/font-woff2/.test(type))
            return 'woff2';
        if(/font-woff/.test(type))
            return 'woff';

        return null;
    }

    function guessFontFormatByExtension(extension) {
        switch(extension) {
            case 'woff2':
            case 'woff':
            case 'svg':
                return extension;
            case 'eot':
                return 'embedded-opentype';
            case 'ttf':
                return 'truetype';
            case 'otf':
                return 'opentype';
            default:
                return null;
        }
    }

    throw new UnrecognizedFontError("Unrecognized font type "+type+" with extension "+extension);
}

function UnrecognizedFontError(message) {
    this.message = message;
    this.stack = (new Error()).stack;
}
UnrecognizedFontError.prototype = Object.create(Error.prototype);
UnrecognizedFontError.prototype.name = 'UnrecognizedFontError';
