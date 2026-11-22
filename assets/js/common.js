// aHR0cHM6Ly9naXRodWIuY29tL2x1b3N0MjYvYWNhZGVtaWMtaG9tZXBhZ2U=
$(function () {
    lazyLoadOptions = {
        scrollDirection: 'vertical',
        effect: 'fadeIn',
        effectTime: 300,
        placeholder: "",
        onError: function(element) {
            console.log('[lazyload] Error loading ' + element.data('src'));
        },
        afterLoad: function(element) {
            if (element.is('img')) {
                // remove background-image style
                element.css('background-image', 'none');
            } else if (element.is('div')) {
                // set the style to background-size: cover; 
                element.css('background-size', 'cover');
                element.css('background-position', 'center');
            }
        }
    }

    $('img.lazy, div.lazy:not(.always-load)').Lazy({visibleOnly: true, ...lazyLoadOptions});
    $('div.lazy.always-load').Lazy({visibleOnly: false, ...lazyLoadOptions});

    $('[data-toggle="tooltip"]').tooltip()

    var $grid = $('.grid').masonry({
        "percentPosition": true,
        "itemSelector": ".grid-item",
        "columnWidth": ".grid-sizer"
    });
    // layout Masonry after each image loads
    $grid.imagesLoaded().progress(function () {
        $grid.masonry('layout');
    });

    $(".lazy").on("load", function () {
        $grid.masonry('layout');
    });

    var $themeToggle = $('#theme-toggle');
    function syncThemeToggle() {
        var dark = document.documentElement.getAttribute('data-theme') === 'dark';
        $themeToggle.find('i').attr('class', dark ? 'fas fa-sun' : 'fas fa-moon');
        $themeToggle.attr('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
    }
    syncThemeToggle();
    $themeToggle.on('click', function () {
        var dark = document.documentElement.getAttribute('data-theme') === 'dark';
        if (dark) {
            document.documentElement.removeAttribute('data-theme');
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
        }
        try {
            sessionStorage.setItem('theme', dark ? 'light' : 'dark');
        } catch (e) { /* storage unavailable: theme lasts for this page only */ }
        syncThemeToggle();
    });

    $(document).on('click', '.authors-toggle', function (event) {
        event.preventDefault();
        var $more = $(this).prev('.authors-more');
        var expand = $more.prop('hidden');
        $more.prop('hidden', !expand);
        $(this).text(expand ? 'show less' : 'et al.').attr('aria-expanded', String(expand));
    });

    $(document).on('click', '.abstract-toggle', function (event) {
        event.preventDefault();
        var expand = !$(this).parent().hasClass('is-open');
        $(this).parent().toggleClass('is-open', expand);
        $(this).html(expand ? '&larr; Collapse' : '&rarr; Expand').attr('aria-expanded', String(expand));
    });

    $(document).on('click', '.pub-industry-toggle', function (event) {
        event.preventDefault();
        var block = $(this).closest('.pub-industry')[0];
        var open = !block.classList.contains('is-open');
        block.classList.toggle('is-open', open);
        if (!open) { fitIndustry(block); }
        // The clicked toggle is now hidden; keep keyboard focus on its counterpart,
        // or on the block when the list fits again and no toggle is left.
        var next = block.querySelector(open ? '.pub-industry-less' : '.pub-industry-more');
        (next && next.offsetParent ? next : block).focus({ preventScroll: true });
    });

    initNewsPeek();
    initPublicationFilters();
    initIndustryFit();
})

// Industry recognition: CSS confines the list to the room left under the cover
// date. Here the list is cut at a whole number of lines and gets its Expand
// toggle, but only when it does not fit.
function fitIndustry(block) {
    if (block.classList.contains('is-open') || !block.offsetParent) { return; }
    var text = block.querySelector('.pub-industry-text');
    block.classList.remove('is-clamped');
    var line = parseFloat(getComputedStyle(text).lineHeight);
    if (!line) { return; }
    // The label has a line to itself (two in a narrow column); the block is
    // never shorter than the label plus one line of companies.
    var label = block.querySelector('.pub-industry-label');
    var labelLines = Math.max(1, Math.round(label.getBoundingClientRect().height / line));
    block.style.setProperty('--industry-label-lines', labelLines);
    var lines = Math.max(labelLines + 1, Math.floor((block.clientHeight + 1) / line));
    if (text.getBoundingClientRect().height > lines * line + 1) {
        block.style.setProperty('--industry-lines', lines);
        block.classList.add('is-clamped');
    }
}

function initIndustryFit() {
    var blocks = Array.prototype.slice.call(document.querySelectorAll('.pub-industry'));
    if (!blocks.length) { return; }

    function fitAll() { blocks.forEach(fitIndustry); }

    fitAll();
    // The room changes whenever a card re-wraps, a cover finishes loading or a
    // filter shows the card again; each of those resizes the block.
    if (window.ResizeObserver) {
        var observer = new ResizeObserver(function (entries) {
            entries.forEach(function (entry) { fitIndustry(entry.target); });
        });
        blocks.forEach(function (block) { observer.observe(block); });
    } else {
        window.addEventListener('resize', fitAll);
    }
    if (document.fonts && document.fonts.ready) { document.fonts.ready.then(fitAll); }
}

// News: the newest item(s) show in full, the next one fades out as a teaser, and
// the button opens the whole list. The heights are measured here because items
// wrap differently at every width; the fade itself is CSS.
function initNewsPeek() {
    var body = document.getElementById('news-body');
    var btn = document.getElementById('more-news-btn');
    if (!body || !btn) { return; }

    var list = body.querySelector('.news-list');
    var items = Array.prototype.slice.call(body.querySelectorAll('.news-item'));
    var visible = Number(body.getAttribute('data-visible')) || 1;
    var teaser = items[visible];
    if (!teaser) { return; }

    // A new measurement (first load, re-wrap on resize, late web fonts) applies at
    // once: transitions are off while it settles, so only the button animates.
    function measure() {
        var cut = teaser.getBoundingClientRect().top - list.getBoundingClientRect().top;
        body.classList.remove('is-ready');
        body.style.setProperty('--news-cut', Math.round(cut) + 'px');
        body.style.setProperty('--news-full', Math.ceil(list.getBoundingClientRect().height) + 'px');
        void body.offsetHeight;
        body.classList.add('is-ready');
    }

    function setOpen(open) {
        body.classList.toggle('is-open', open);
        btn.setAttribute('aria-expanded', String(open));
        btn.querySelector('span').textContent = open ? 'Show less' : 'Show more';
        btn.querySelector('i').className = open ? 'fas fa-chevron-up' : 'fas fa-chevron-down';
    }

    measure();
    if (window.ResizeObserver) {
        new ResizeObserver(measure).observe(list);
    } else {
        window.addEventListener('resize', measure);
    }

    btn.addEventListener('click', function () {
        setOpen(!body.classList.contains('is-open'));
    });

    // Tabbing to a link in the clipped part opens the list, so focus is never hidden.
    body.addEventListener('focusin', function (event) {
        var item = event.target.closest('.news-item');
        if (item && items.indexOf(item) >= visible) {
            body.scrollTop = 0;
            setOpen(true);
        }
    });
}

// Publication filters: contribution, year, label, collaborator, citing company,
// plus sort order.
function initPublicationFilters() {
    var $section = $('.publication-section');
    if (!$section.length) { return; }

    var $list = $section.find('.pub-list');
    var $entries = $list.find('.pub-entry');
    var $empty = $list.find('.publication-empty-state');
    var state = { group: 'all', year: 'all', topic: {}, interest: {}, inst: null, cited: null, sort: 'desc' };

    // Filters set by a logo outside the list: a collaborating institution ("inst")
    // or a company that cites the paper ("cited"). A paper lists its keys in
    // data-<facet>, and the chosen one shows as a chip in .pub-<facet>-row.
    var logoFacets = ['inst', 'cited'];

    // Each paper's labels are read from the tags it already shows: the framed
    // tag is its topic, the coloured ones are research interests.
    var labelInfo = { topic: {}, interest: {} };
    $entries.each(function () {
        var own = { topic: {}, interest: {} };
        $(this).find('.interest-tag').each(function () {
            var facet = $(this).hasClass('tag-black-frame') ? 'topic' : 'interest';
            var text = $.trim($(this).text());
            if (own[facet][text]) { return; }
            own[facet][text] = true;
            if (!labelInfo[facet][text]) { labelInfo[facet][text] = { count: 0, cls: this.className }; }
            labelInfo[facet][text].count += 1;
        });
        $(this).data('labels', own);
    });

    function addChip(facet, text, cls) {
        $('<button type="button" aria-pressed="false"></button>')
            .addClass(cls + ' pub-label-chip')
            .attr('data-value', text)
            .text(text)
            .appendTo($section.find('[data-facet="' + facet + '"]'));
    }

    Object.keys(labelInfo.topic).sort().forEach(function (text) {
        addChip('topic', text, labelInfo.topic[text].cls);
    });

    // Interests follow research_interests in _data/profile.yml, which the
    // filter bar carries as data-order; any others come after, alphabetically.
    var placed = {};
    String($section.find('[data-facet="interest"]').attr('data-order') || '').split('|').forEach(function (text) {
        if (!labelInfo.interest[text]) { return; }
        placed[text] = true;
        addChip('interest', text, labelInfo.interest[text].cls);
    });
    Object.keys(labelInfo.interest).sort().forEach(function (text) {
        if (!placed[text]) { addChip('interest', text, labelInfo.interest[text].cls); }
    });

    function matchesLabels($entry, facet) {
        var wanted = Object.keys(state[facet]);
        if (!wanted.length) { return true; }
        var own = $entry.data('labels')[facet];
        return wanted.some(function (label) { return own[label]; });
    }

    function matches($entry) {
        if (state.group !== 'all' && (' ' + $entry.data('groups') + ' ').indexOf(' ' + state.group + ' ') < 0) { return false; }
        if (state.year !== 'all' && String($entry.data('year')) !== state.year) { return false; }
        var missesLogo = logoFacets.some(function (facet) {
            return state[facet] && (' ' + $entry.data(facet) + ' ').indexOf(' ' + state[facet] + ' ') < 0;
        });
        if (missesLogo) { return false; }
        if (!matchesLabels($entry, 'topic') || !matchesLabels($entry, 'interest')) { return false; }
        return true;
    }

    function apply() {
        var shown = 0;
        $entries.each(function () {
            var ok = matches($(this));
            $(this).toggleClass('d-none', !ok);
            if (ok) { shown += 1; }
        });
        $empty.toggleClass('d-none', shown > 0);
        $section.find('.pub-count').text(shown === $entries.length
            ? shown + ' papers'
            : shown + ' of ' + $entries.length + ' papers');
        var filtered = state.group !== 'all' || state.year !== 'all' || state.inst || state.cited ||
            Object.keys(state.topic).length > 0 || Object.keys(state.interest).length > 0;
        $section.find('.pub-reset').toggleClass('d-none', !filtered);
        logoFacets.forEach(function (facet) {
            var $buttons = $('.collab-btn[data-facet="' + facet + '"]');
            $section.find('.pub-' + facet + '-row').toggleClass('d-none', !state[facet]);
            $buttons.closest('.collab-list').toggleClass('has-active', !!state[facet]);
            $buttons.each(function () {
                var active = String($(this).data('key')) === state[facet];
                $(this).toggleClass('active', active).attr('aria-pressed', String(active));
            });
        });
        // Newly revealed covers need a nudge to lazy-load.
        $(window).trigger('scroll');
    }

    function setSingle(facet, value) {
        state[facet] = String(value);
        $section.find('[data-facet="' + facet + '"] [data-value]').each(function () {
            var active = String($(this).data('value')) === state[facet];
            $(this).toggleClass('active', active).attr('aria-pressed', String(active));
        });
    }

    $section.find('[data-facet="group"], [data-facet="year"]').on('click', '[data-value]', function () {
        setSingle($(this).closest('[data-facet]').data('facet'), $(this).data('value'));
        apply();
    });

    function toggleLabel(facet, text) {
        if (state[facet][text]) { delete state[facet][text]; } else { state[facet][text] = true; }
        $section.find('[data-facet="' + facet + '"] .pub-label-chip').each(function () {
            var active = !!state[facet][String($(this).data('value'))];
            $(this).toggleClass('active', active).attr('aria-pressed', String(active));
        });
        apply();
    }

    $section.find('.pub-label-bar').on('click', '.pub-label-chip', function () {
        toggleLabel($(this).closest('[data-facet]').data('facet'), String($(this).data('value')));
    });

    $section.find('.pub-sort-btn').on('click', function () {
        state.sort = state.sort === 'desc' ? 'asc' : 'desc';
        var newest = state.sort === 'desc';
        $(this).attr('data-sort', state.sort).attr('aria-label', 'Sort order: ' + (newest ? 'newest' : 'oldest') + ' first');
        $(this).find('span').text(newest ? 'Newest first' : 'Oldest first');
        $(this).find('i').attr('class', newest ? 'fas fa-arrow-down-wide-short' : 'fas fa-arrow-up-wide-short');
        $entries.get().sort(function (a, b) {
            var diff = Number($(a).data('date')) - Number($(b).data('date'));
            return newest ? -diff : diff;
        }).forEach(function (el) { $empty.before(el); });
        apply();
    });

    function setLogoFilter(facet, key, name) {
        state[facet] = key;
        $section.find('.pub-' + facet + '-name').text(name || '');
    }

    $('.collab-btn').on('click', function () {
        var facet = $(this).data('facet');
        var key = String($(this).data('key'));
        if (state[facet] === key) { setLogoFilter(facet, null); } else { setLogoFilter(facet, key, $(this).data('name')); }
        apply();
        if (state[facet]) { $section[0].scrollIntoView({ block: 'start' }); }
    });

    logoFacets.forEach(function (facet) {
        $section.find('.pub-' + facet + '-chip').on('click', function () {
            setLogoFilter(facet, null);
            apply();
        });
    });

    $section.find('.pub-reset').on('click', function () {
        setSingle('group', 'all');
        setSingle('year', 'all');
        state.topic = {};
        state.interest = {};
        $section.find('.pub-label-chip').removeClass('active').attr('aria-pressed', 'false');
        logoFacets.forEach(function (facet) { setLogoFilter(facet, null); });
        apply();
    });

    apply();
}
