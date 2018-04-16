function Iq(a) {
    function b() {
        k || ((t = wp(g)) ? (n = g.m, p = g.I, q = g.g, r = g.J, m = 0) : (n = a.K.Qa[a.Ha], p = a.Va, r = q = null, m = 1), l = a.aa[a.T].N, k = new Date)
    }

    function c() {
        500 <= new Date - k && (t && 0 !== m || (q = a.K.Qa[a.Ha], r = a.Va, t = !1, m = 1), h.push([n, p, q, r, l, m, t ? 1 : 0]));
        k = null
    }

    function d() {
        if (!a.la) {
            var b = {
                s: a.K.vc,
                plays: JSON.stringify(h),
                t: A
            };
            w && (b.sid = w);
            z || (z = !0, Tc("POST", "/practicesession/index.json", b, function(a) {
                w || (w = a.sid);
                z = !1
            }, function() {
                z = !1
            }), h = [], x = new Date)
        }
    }

    function e() {
        var a = new Date;
        A += Math.min(a - v, 3E5);
        v = a;
        12E4 <= a - x && d()
    }

    var f = a.m,
        g = a.J,
        h = [],
        k = null,
        l = null,
        m = 0,
        n = 0,
        p = 0,
        q = null,
        r = null,
        t = !1,
        w = null,
        v = new Date,
        x = v,
        A = 0,
        z = !1;
    u(window, "unload", function() {
        e();
        d()
    });
    a.assign([51, 68, 60, 59, 25, 71, 13, 57, 61, 62, 54, 76, 75, 49, 73, 30], function() {
        e()
    }, [34], function() {
        m++
    }, [53, 14], function() {
        e();
        rk(f) && (c(), b())
    }, [43], function() {
        e();
        b()
    }, [40], function() {
        c();
        e();
        d()
    })
}


hm(function() {
    var a = ao(),
        b = window.location.pathname + "scoredata/index.json",
        c = new Gq(B("appandedit"), !0, a);
    a.h && (b += "?h=" + a.h);
    "1" === a.horiz && xn(c, !0);
    "2" === a.hscroll_type && (c.Xc = 2);
    "2" === a.scroll_type && (c.Kc = 2);
    "0" === a.collapse_empty && (c.xc = !1);
    "1" === a.hshrink && (c.jd = !0);
    "0" === a.enable_waveform && (c.wc = !1);
    if (a.speed) {
        var d = a.speed;
        /^\d+$/.test(d) && (c.m.I = parseInt(d, 10) / 100)
    }
    a.zoom && (a = a.zoom, /^-?\d+$/.test(a) && yl(c, 36 + parseInt(a, 10), !0));
    Pq(c, b);
    soundslice.reader = c
});