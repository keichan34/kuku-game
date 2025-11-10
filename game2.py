#!/usr/bin/env python3

import random
import subprocess

GREEN = "\033[32m"
RED = "\033[31m"
CYAN = "\033[36m"
BOLD = "\033[1m"
RESET = "\033[0m"
BELL = "\a"

# 九九の練習ゲーム（ランダム20問＋連続正解数）
def kuku_game():
    questions = [(i, j) for i in range(1, 10) for j in range(1, 10)]
    selected = random.sample(questions, 20)

    score = 0
    current_streak = 0
    best_streak = 0

    for idx, (i, j) in enumerate(selected, start=1):
        answer = i * j

        while True:
            prompt = f"{CYAN}{BOLD}[{idx}/20] {i} x {j} = {RESET}"
            raw_input_value = input(prompt).strip()
            if not raw_input_value:
                print("入力が空です。数字を入力してください。")
                continue
            try:
                user_input = int(raw_input_value)
                break
            except ValueError:
                print("数字で答えてください。")

        if user_input == answer:
            print(f"{GREEN}{BOLD}正解！{RESET}")
            score += 1
            current_streak += 1
            best_streak = max(best_streak, current_streak)
        else:
            message = f"不正解。{i} かける {j} の正しい答えは {answer} です。"
            print(f"{BELL}{RED}{BOLD}{message}{RESET}")
            current_streak = 0
            try:
                subprocess.run(["say", "-v", "Kyoko", message], check=False)
            except FileNotFoundError:
                print("音声出力に失敗しました（say コマンドが見つかりません）。")

        print(f"{BOLD}現在のスコア: {score}/20 | 連続正解: {current_streak}{RESET}")

    percentage = (score / 20) * 100
    print(
        f"ゲーム終了！最終スコアは {score}/20 ({percentage:.0f}%)。"
        f"最高連続正解数は {best_streak} でした。"
    )

if __name__ == "__main__":
    kuku_game()
