function Sq(a) {
    for (var b = window.initSync, c = a.aa, d = c.length, e; d--;)if (e = c[d], e.N === b) {
        Sm(a, e.index);
        break
    }
}
function Tq(a, b) {
    var c = a[b];
    if (c)for (var d = c.length; d--;)if (c[d].checked)return c[d].value;
    return null
}
function Uq(a) {
    this.o = a;
    this.g = !1;
    this.m = B("scoredetailsform");
    window.soundslice.isNonfree || F(this.m, "unpaid");
    a.K.fc && F(this.m, "iscover");
    var b = this, c = B("showscoredetails");
    G(c, "hidden");
    u(c, "click", function () {
        Vq(b, !0)
    });
    u(B("closescoredetails"), "click", function (a) {
        a.preventDefault();
        Vq(b, !1)
    });
    a.assign([21], function () {
        Wq(b)
    });
    u(window, "beforeunload", function (a) {
        if (b.g)return a.returnValue = "You have unsaved changes. Are you sure you want to leave this page?"
    })
}
Uq.prototype = {};
function Wq(a) {
    if (a.g) {
        var b = a.o, c = b.K, d;
        c.fc ? d = {description: c.tc} : d = {
            name: c.Wb,
            artist: c.Sb,
            description: c.tc,
            allow_comments: c.lc ? "True" : "False",
            allow_covers: c.mc ? "True" : "False",
            embed_status: c.R,
            hide_notation: c.N ? "False" : "True",
            can_print: b.Ub ? "True" : "False"
        };
        b.dispatch(23);
        Tc("POST", "/api/v1/scores/" + c.aa + "/", d, function () {
            b.dispatch(22);
            a.g = !1
        }, function () {
            b.dispatch(22);
            b.dispatch(24, ["There was an error during saving.", !1])
        })
    }
}
function Vq(a, b) {
    var c = a.o, d = c.K, e = a.m;
    if (b) e.n.value = d.Wb, e.a.value = d.Sb, e.d.value = d.tc, e.c.checked = d.lc, e.v.checked = d.mc, e.embed_status.value = d.R, e.hidenotation.checked = !d.N, e.canprint.checked = c.Ub; else {
        var f = e.n.value, g = e.a.value, h = e.d.value, k = e.c.checked, l = e.v.checked,
            m = parseInt(Tq(e, "embed_status"), 10), n = !e.hidenotation.checked, e = e.canprint.checked;
        if (d.Wb !== f || d.Sb !== g || d.tc !== h || d.lc !== k || d.mc !== l || d.R !== m || d.N !== n || c.Ub !== e) a.g = !0, a.o.dispatch(50);
        d.Wb = f;
        d.Sb = g;
        d.tc = h;
        d.lc = k;
        d.mc = l;
        d.R = m;
        d.N = n;
        c.Ub = e
    }
    H(B("scoredetailsmodal"), "active", b)
}
function Xq(a, b) {
    function c() {
        Yq(d, !0)
    }

    this.o = a;
    this.I = b;
    this.g = B("addrecordingform");
    this.J = B("addrecordingmodal");
    this.m = B("addrecordingerror");
    var d = this;
    u(B("addrecording"), "click", c);
    u(B("addrecording-empty"), "click", c);
    u(B("emptyaddrecording"), "click", c);
    u(this.g, "submit", function (a) {
        a.preventDefault();
        Zq(d)
    });
    for (var e = this.g.s, f = e.length; f--;)u(e[f], "change", function () {
        $q(d)
    })
}
Xq.prototype = {};
function Zq(a) {
    var b = a.o, c = a.I, d = a.g, e = parseInt(Tq(d, "s"), 10), d = 1 === e ? d.yi.value : d.vu.value;
    2 === e || 6 === e || 7 === e ? window.location = "/manage/" + b.K.vc + "/recording/?source=" + e : (d = {
        name: "Video",
        source: e,
        source_data: d
    }, Tc("POST", "/api/v1/scores/" + b.K.aa + "/recordings/", d, function (d) {
        d = b.Uc(e, d.id, "Video", null, "", null, null, null, !1, {
            sd: d.source_data,
            mediaurl: d.media_url,
            renwurl: d.renew_url
        });
        Sm(b, d.index);
        ar(c, !0);
        Yq(a, !1)
    }, function (b) {
        if (b = JSON.parse(b).errors.source_data) a.m.innerHTML = b[0], F(a.m, "active")
    }))
}
function $q(a) {
    var b = a.g, c = Tq(b, "s");
    G(b, "source1");
    G(b, "source2");
    G(b, "source3");
    G(b, "source6");
    G(b, "source7");
    F(b, "source" + c);
    G(a.m, "active")
}
function Yq(a, b) {
    if (b) {
        var c = a.g;
        c.yi.value = "";
        c.vu.value = "";
        c.s.value = 1;
        $q(a)
    }
    H(a.J, "active", b)
}
function br(a) {
    this.o = a;
    this.m = !1;
    this.J = B("visibilitytip");
    this.I = !1;
    this.g = B("visibilityform");
    window.soundslice.isNonfree || F(this.g, "unpaid");
    var b = this;
    a.assign([21], function () {
        cr(b)
    });
    u(B("visibilitybutton"), "click", function () {
        dr(b, !b.I)
    });
    u(this.g, "click", function () {
        var a = b.o.K, d = Tq(b.g, "v");
        (a.I ? 3 : 1 === a.J ? 1 : 2) != d && (b.m = !0, 3 == d ? (a.I = !0, a.J = 1) : 2 == d ? (a.I = !1, a.J = 3) : (a.I = !1, a.J = 1), b.o.dispatch(82));
        dr(b, !1)
    });
    u(window, "beforeunload", function (a) {
        if (b.m)return a.returnValue = "You have unsaved changes. Are you sure you want to leave this page?"
    })
}
br.prototype = {};
function cr(a) {
    if (a.m) {
        var b = a.o, c = b.K, d = {is_public: c.I ? "True" : "False", status: c.J};
        b.dispatch(23);
        Tc("POST", "/api/v1/scores/" + c.aa + "/", d, function () {
            b.dispatch(22);
            a.m = !1
        }, function () {
            b.dispatch(22);
            b.dispatch(24, ["There was an error during saving.", !1])
        })
    }
}
function er(a) {
    B("chanpuberror").innerHTML = a;
    H(B("chanpuberror"), "active", !!a);
    H(B("chanpubradio"), "disabled", !!a)
}
function dr(a, b) {
    var c = a.o, d = c.K;
    a.I !== b && (a.I = b, H(a.J, "active", b), b && (a.g.v.value = d.I ? 3 : 1 === d.J ? 1 : 2, d.N ? d.U.length ? d.fc && 2 > c.aa[1].m.length ? er("Please create at least two syncpoints before posting this to your channel.") : er("") : er("Please create some notation/tab before posting this to your channel.") : er("Please uncheck 'Hide notation' if you want to post this to your channel.")))
}
function fr(a) {
    function b(a) {
        a.preventDefault()
    }

    this.o = a;
    this.g = !1;
    this.J = "https://d2c3nvafyekx5z.cloudfront.net/scripts/synceditor.min-9ccedfa57f1d3d25977e579347ce3c38.js";
    this.m = "https://d2c3nvafyekx5z.cloudfront.net/scripts/editor.min-76971c8e619a0095837bb754025018b7.js";
    new Uq(a);
    new Xq(a, this);
    new br(a);
    this.I = 0;
    var c = this;
    u(B("emptyopeneditor"), "mousedown touchstart", xf(function () {
        gr(c, 103)
    }));
    u(B("emptyuploadnotation"), "mousedown touchstart", xf(function () {
        gr(c, 208)
    }));
    u(bf(a, "player-empty-recording"), "drop", b, "dragenter", b, "dragover", b);
    u(bf(a, "player-empty-notation"), "drop", b, "dragenter", b, "dragover", b)
}
fr.prototype = {};
function gr(a, b) {
    a.m ? (window.onEditorOpen = b, hr(a, !0)) : (hr(a, !0), a.o.dispatch(86, b))
}
function hr(a, b) {
    if (b !== a.o.N)if (b && !a.g && ir(a, !0), a.o.N = b, H(B("editorpane"), "active", b), B("editortogglechk").checked = b, a.m) {
        if (b) {
            var c = document.createElement("script");
            c.src = a.m;
            document.head.appendChild(c);
            a.m = ""
        }
    } else a.o.dispatch(20, b)
}
function ar(a, b) {
    if (b !== a.o.la)if (b && !a.g && ir(a, !0), a.o.la = b, a.J) {
        if (b) {
            var c = document.createElement("script");
            c.src = a.J;
            document.head.appendChild(c);
            a.J = ""
        }
    } else a.o.dispatch(65, b)
}
function jr(a) {
    var b = a.o;
    a = a.g;
    H(bf(b, "player-empty-recording"), "active", a && 1 === b.aa.length);
    H(bf(b, "player-empty-notation"), "active", a && !b.K.U.length);
    H(bf(b, "notation"), "no-notation", a && !b.K.U.length)
}
function ir(a, b) {
    if (b !== a.g) {
        var c = a.o;
        a.g = b;
        c.Yc = b;
        H(document.body, "editmode", b);
        jr(a);
        b ? c.dispatch(81) : (c.dispatch(85), ar(a, !1), hr(a, !1))
    }
}
function kr() {
    var a = new fr(soundslice.reader), b = a.o, c = b.K, d = B("editmenusave"), e = B("synceditortoggle"),
        f = B("editortoggle"), g = B("editbarcurrentvisibility");
    F(B("navlinkeditmode"), "active");
    F(B("navmenueditmode"), "active");
    e && u(e, "click", xf(function () {
        ar(a, !b.la);
        xm()
    }));
    f && (ao().editor && hr(a, !0), u(f, "click", xf(function () {
        hr(a, !b.N);
        xm()
    })));
    u(B("entereditmode"), "click", function () {
        ir(a, !0)
    });
    u(B("entereditmode-inmenu"), "click", function () {
        ir(a, !0)
    });
    u(B("editmenuexit"), "click", function () {
        ir(a, !1)
    });
    u(d,
        "click", function () {
            b.dispatch(21)
        });
    u(window, "keydown", function (c) {
        a.g && c.metaKey && 83 === c.which && (b.dispatch(21), c.preventDefault())
    });
    b.assign([18, 64, 50, 82], function () {
        G(d, "inactive")
    }, [23], function () {
        a.I++;
        F(d, "inactive");
        d.innerHTML = "Saving"
    }, [22], function () {
        a.I--;
        a.I || (F(d, "inactive"), d.innerHTML = "Save")
    }, [83, 81, 82], function () {
        g.innerHTML = c.I ? "Public on your channel" : 1 === c.J ? "Private" : "Unlisted"
    }, [4, 17, 209, 210, 2], function () {
        jr(a)
    });
    b.dispatch(83);
    !c.Nb || c.Fc || c.U.length || ir(a, !0);
    window.initSync &&
    (Sq(b), ar(a, !0))
}
Tc("GET", "/editbarui/", null, function (a) {
    var b = B("editbarpane");
    B("editbarpane").innerHTML = a.html;
    soundslice.activateModalClosers(b);
    kr()
}, ya);