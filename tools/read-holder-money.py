import csv


# 读取csv至字典
csvFile = open(
    "export-tokenholders-for-contract-0x852a4c5948524649d6f323d739b61ff6aa54f384.csv", "r")
reader = csv.reader(csvFile)

# 建立空字典
result = {}
for item in reader:
    # 忽略第一行
    if reader.line_num == 1:
        continue
    result[item[0]] = item[1]

csvFile.close()
print(result)
