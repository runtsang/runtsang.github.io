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

    initPublicationFilters();
})

// Publication filters: contribution, year, label, collaborator, plus sort order.
function initPublicationFilters() {
    var $section = $('.publication-section');
    if (!$section.length) { return; }

    var $list = $section.find('.pub-list');
    var $entries = $list.find('.pub-entry');
    var $empty = $list.find('.publication-empty-state');
    var state = { group: 'all', year: 'all', topic: {}, interest: {}, inst: null, sort: 'desc' };

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

    // Interests follow the order (and colours) of the Research Interests in the bio.
    var $bioTags = $('.research-interests .interest-tag');
    var placed = {};
    $bioTags.each(function () {
        var text = $.trim($(this).text());
        if (!labelInfo.interest[text]) { return; }
        placed[text] = true;
        addChip('interest', text, this.className);
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
        if (state.inst && (' ' + $entry.data('inst') + ' ').indexOf(' ' + state.inst + ' ') < 0) { return false; }
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
        var filtered = state.group !== 'all' || state.year !== 'all' || state.inst ||
            Object.keys(state.topic).length > 0 || Object.keys(state.interest).length > 0;
        $section.find('.pub-reset').toggleClass('d-none', !filtered);
        $section.find('.pub-inst-row').toggleClass('d-none', !state.inst);
        $('.collab-list').toggleClass('has-active', !!state.inst);
        $('.collab-btn').each(function () {
            var active = $(this).data('inst') === state.inst;
            $(this).toggleClass('active', active).attr('aria-pressed', String(active));
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

    // The Research Interests in the bio act as shortcuts to the same filter.
    $bioTags.each(function () {
        var text = $.trim($(this).text());
        if (!labelInfo.interest[text]) { return; }
        $(this).addClass('is-clickable').attr({ role: 'button', tabindex: 0, title: 'Show papers on ' + text })
            .on('click keydown', function (event) {
                if (event.type === 'keydown' && event.key !== 'Enter' && event.key !== ' ') { return; }
                event.preventDefault();
                toggleLabel('interest', text);
                $section[0].scrollIntoView({ block: 'start' });
            });
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

    function setInstitution(key, name) {
        state.inst = key;
        $section.find('.pub-inst-name').text(name || '');
    }

    $('.collab-btn').on('click', function () {
        var key = $(this).data('inst');
        if (state.inst === key) { setInstitution(null); } else { setInstitution(key, $(this).data('name')); }
        apply();
        if (state.inst) { $section[0].scrollIntoView({ block: 'start' }); }
    });

    $section.find('.pub-inst-chip').on('click', function () {
        setInstitution(null);
        apply();
    });

    $section.find('.pub-reset').on('click', function () {
        setSingle('group', 'all');
        setSingle('year', 'all');
        state.topic = {};
        state.interest = {};
        $section.find('.pub-label-chip').removeClass('active').attr('aria-pressed', 'false');
        setInstitution(null);
        apply();
    });

    apply();
}
