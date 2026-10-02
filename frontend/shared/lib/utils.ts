import { createCn } from "cn/config";

// Os papéis de tipografia do index.css são tamanhos de fonte: sem isto, o merge
// confunde "text-kpi" com uma cor e descarta um dos dois ao juntar com "text-gain"
export const cn = createCn({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: [
            "page-title",
            "section-title",
            "kpi",
            "kpi-sm",
            "body",
            "label",
            "table",
            "caption",
            "eyebrow",
            "ticker",
            "2xs",
          ],
        },
      ],
    },
  },
});
