import type { ConversionFormValues } from "../types";

export const SAMPLE_INPUT_BADGE_LABEL = "Sample Input";
export const SAMPLE_INPUT_NOTE =
  "示例章节仅用于填充输入素材，不会自动生成结果，也不是固定剧本输出。";

export const sampleInputFormValues: ConversionFormValues = {
  title: "雾港追缉令",
  adaptation_mode: "dramatic",
  chapters: [
    {
      id: "chapter_01",
      title: "第 1 章",
      content:
        "林雾在旧码头接到匿名信，信里只写着一句话：你哥哥还活着。她原本已经准备离开雾港，却因为这句话重新回到多年不敢靠近的城区。"
    },
    {
      id: "chapter_02",
      title: "第 2 章",
      content:
        "她在鱼市和报亭之间追查消息，发现暴雨夜的巡防调度记录被人删改。一个卖海盐的少年告诉她，那晚有人从北栈桥押走了一名不该存在的囚犯。"
    },
    {
      id: "chapter_03",
      title: "第 3 章",
      content:
        "深夜钟楼里，周队长承认自己参与过押运，却坚持哥哥早已死在途中。林雾逼他交出剩下的卷宗，而楼下巡防铃声已经响起，整座港城开始封锁。"
    }
  ]
};
