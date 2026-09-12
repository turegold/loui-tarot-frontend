// CloudFront Function (viewer request 이벤트에 연결).
// AWS 콘솔 > CloudFront > Functions > Create function 에서 이 내용을 그대로 붙여넣는다.
//
// 역할 두 가지:
// 1) 런타임에 생성되는 slug 경로(/chemi/{slug}, /chemi/{slug}/guest, /fortune/{slug})를
//    빌드 타임에 미리 만들어둔 셸(shell) HTML로 리라이트한다 — 실제 데이터는 그 셸 안의
//    클라이언트 컴포넌트가 API를 직접 호출해서 채운다 (인프라 아키텍처.md).
// 2) 그 외 확장자 없는 정적 경로(/home, /my 등)는 S3에 실제로 존재하는 "{경로}.html" 파일을
//    찾도록 .html을 붙여준다 — `next build`(output: export)가 트레일링 슬래시 없이
//    파일을 내보내기 때문.
function handler(event) {
    var request = event.request;
    var uri = request.uri;

    var shellRules = [
        { pattern: /^\/chemi\/[^/]+\/guest\/?$/, exclude: /^\/chemi\/new\/guest\/?$/, target: "/chemi/_shell/guest.html" },
        { pattern: /^\/chemi\/[^/]+\/?$/, exclude: /^\/chemi\/new\/?$/, target: "/chemi/_shell.html" },
        { pattern: /^\/fortune\/[^/]+\/?$/, exclude: /^\/fortune\/(topic|spread)\/?$/, target: "/fortune/_shell.html" },
    ];

    for (var i = 0; i < shellRules.length; i++) {
        var rule = shellRules[i];
        if (rule.pattern.test(uri) && !rule.exclude.test(uri)) {
            request.uri = rule.target;
            return request;
        }
    }

    // 루트("/")는 CloudFront의 Default Root Object(index.html) 설정이 처리하므로 건드리지 않는다.
    if (uri !== "/" && uri.indexOf(".") === -1) {
        request.uri = uri.replace(/\/$/, "") + ".html";
    }

    return request;
}
