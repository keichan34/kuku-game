#!/usr/bin/env python3

import random

# 九九の練習ゲーム
def kuku_game():
    score = 0
    for i in range(1, 10):
        for j in range(1, 10):
            answer = i * j
            user_input = int(input(f"{i} x {j} = "))
            if user_input == answer:
                print("正解！")
                score += 1
            else:
                print(f"不正解。正しい答えは {answer} です。")
    print(f"ゲーム終了！あなたのスコアは {score} です。")

if __name__ == "__main__":
    kuku_game()
