---
status: publish
author: harumonia
noThumbInfoStyle: default
outdatedNotice: "no"
reprint: standard
thumbChoice: default
thumbStyle: default
hidden: false
email: zxjlm233@gmail.com
date: 2021-09-17 22:03:57
updated: 2021-09-17 11:08:02
title: bash脚本 - 过期日志文件清理
tags:
  - 实用小工具
  - 脚本
categories:
  - 源流清泉
  - Shell
customSummary:
thumb:
thumbDesc:
thumbSmall:
---

公司服务器上的日志文件多年积压, 已经占用了很大一部分不必要的内存空间. 所以本篇将完成一个功能性脚本, 其内容是扫描过期的日志文件, 并对文件进行对应的操作.

好久没有写过 bash 脚本了, 本篇也算是对这项技能的一个温习吧.

<!-- more -->

## 明确需求

这个脚本最核心的目标是 **清理过期的日志文件** , 然后就是需要考虑如何进行清理(清理的逻辑).

文件是否需要被清理, 其依据文件的最后修改日期, 该内容可以通过 `ls -l` 或者 `date -r` 等命令实现.

在确定文件需要被清理之后, TL 给出的需求是, 6 个月 ~ 12 个月的清空, 大于 12 个月的删除. 这里比较敏感的是删除操作, 如果该文件被 python 的`open()` 之类的命令打开, 而没有被 `f.close()`, 文件的句柄无法释放, 强行使用 `rm` 命令无法达到空间释放的目的(需要进行重启才能释放句柄, 进而释放内存). 所以, 在进行删除操作之前, 最好看一下文件句柄的情况.

最后, 类似日期 \ 路径等参数, 最好是能够从外部输入, 这样最为灵活.

## 开工

### bash 复习

bash 脚本的学习与回顾强推 [Bash 脚本教程](https://wangdoc.com/bash/intro.html), 其中对 bash 以及其引申的一些知识都做得很好.

预料中, 这个脚本需要用到的指令如下:

- find
- readarray
- rm
- kill
- echo

另外, 条件判断 \ 循环 \ 函数 \ 数组这几项也需要有所了解.

## 查找过期文件

一开始笔者准备通过 `ls` + `awk` 来实现找到过期文件的目的的, 但是这样逻辑上会比较复杂, 后来想到可以直接使用 `find` 嘛~

核心代码如下, `-iname` 等相关的参数可以使用 `man find` 了解.

```bash
# path_dir: 文件的路径
# remove_timeline: 最后修改日期大于(+)这个时间则会被删除

find $path_dir -iname "*.log*" -atime +$remove_timeline -type f
```

## 处理文件

直接对 _find_ 得到的结果进行遍历处理即可, 但是在实际操作之中, 去发现了一些比较奇怪的文件.

比如 `/logs/ example1.log`, 这个文件不知为何以 _空格_ 开头, 这在对 find 的结果做切分时会被切分为两个子串, 不仅达不到我们的目的, 甚至会成为安全隐患.

所以在这里, 将 find 的结果进行预切分, 形成数组, 然后对每个元素进行清洗. 这里参考了[stackover flow](https://stackoverflow.com/questions/10586153/how-to-split-a-string-into-an-array-in-bash)的回答, 其代码如下.

```bash
# bash version >= 4.4
readarray -d '' files_half_year_ago < <(find $path_dir -iname "*.log*" -atime -$remove_timeline -atime +$clean_timeline -type f -print0);

# bash version < 4.4
# files_half_year_ago=()
# while IFS=  read -r -d $'\n'; do
#     files_half_year_ago+=("$REPLY")
# done < <(find $path_dir -iname "*.log*" -atime -$remove_timeline -atime +$clean_timeline -type f)
```

这里将 find 的结果存入了 `files_half_year_ago` 变量, 接下来使用 for 循环遍历该数组.

```bash
fine_handler(){
    # 文件处理函数
}

for filename in "${files_half_year_ago[@]}"; do
    file_handler "clean" $filename
done
```

需要注意的是, `"${files_half_year_ago[@]}"` 的双引号不能丢掉, 不然空格在遍历时仍然会作为拆分符号被使用.

`file_handler` 函数接收两个参数, 第一个参数是操作, 如 "_clean_". 第二个参数, 更严谨地说应该是第二组参数, 是文件的路径, 如果其中没有空格, 则就是一个字符串, 而如果其中有空格, 则会被作为两个字符串参数处理. 所以, 在函数接收参数时, 需要用一个取巧的办法.

```bash
file_handler() {
    local option=$1
    shift
    local file_name="$@"

    ...
}
```

这样, 即使路径因为分隔符而被作为多个参数传入了, 仍然会被约束为一个完整的字符串使用. 需要注意的是, 在后续的使用中都需要对 _filename_ 变量添加双引号.

## 文件操作

至此, 我们已经能够顺利地遍历 `find` 的结果了. 接下来就是对文件进行操作.

正如前面的分析, 在对文件进行操作之前, 我们需要知道文件的句柄有没有被其他进程调用. 这里我的判断方法就是使用 `lsof` 查看文件使用被其他进程使用. 核心代码如下:

```bash
local process_list=`lsof -t "$file_name"`
if [ "$process_list" ]; then
    kill -9 $process_list
fi
```

这里将 `lsof` 的结果交给了 _process list_ 变量, 然后进行判断, 如果 lsof 为空, 或者只有 1 个进程在调用, 则可以直接使用 `[ $process_list ]`, 但是当有多个进程调用时, 再使用这个命令就会出错了, 所以最保险的是如上代码所示, 使用双引号将 process_list 包起来.

到这里, 文件相关的进程被 kill 掉, 句柄自然也就释放了, 接下来进行文件操作也就无所顾忌.

- 删除: `rm $file_name`
- 清空: `echo '' > $file_name`

## 完整的脚本

一个完整的脚本, 输入参数 \ 使用说明等内容都是缺不得的, 最好还要在各个处理阶段加上一些输出内容. 所以, 最终代码如下.

删除 \ 清空 这些敏感操作已经在展示代码中去除了, 可以自行在注释的位置添加.

```bash
#!/bin/bash

remove_timeline=365
clean_timeline=180
path_dir=-1
force_clean=0

Help()
{
   echo "Log clean tool."
   echo
   echo "Syntax: scriptTemplate [-p|h|t|T|v]"
   echo "options:"
   echo "-p     Path of log files."
   echo "-f     Force clean | remove files. It will kill the releated process."
   echo "-h     Print this Help."
   echo "-v     Verbose mode."
   echo "-T     Num of days. File modified time over than this nums will be delete. default 365"
   echo "-t     Num of days. File modified time over than this nums will be clean. default 180"
   echo
}

file_handler() {
    local option=$1
    shift
    local file_name="$@"

    if ! [ "$file_name" ]; then
        echo "invalid filename: $file_name , skip it"
        return
    fi

    local process_list=`lsof -t "$file_name"`
    if [ "$process_list" ]; then
        if [ $force_clean -eq 1 ]; then
            kill -9 $process_list
        else
            printf "file $file_name is been used,\nprocess pid:\n--------\n$process_list\n--------\nskip it\n"
            continue
        fi
    fi

    if [ $option == "delete" ]; then
        echo "delete" $file_name
        # 删除操作
    elif [ $option == "clean" ]; then
        echo "clean" $file_name
        # 清空操作
    else
        echo "invalid option"
    fi
}

while getopts "hvfp:t:T:" option; do
   case $option in
        f)
            force_clean=1
            ;;
        h)
            Help
            exit 0
            ;;
        p)
            path_dir="$OPTARG"
            ;;
        v)
            echo "to be continue"
            exit 1
            ;;
        T)
            remove_timeline="$OPTARG"
            ;;
        t)
            clean_timeline="$OPTARG"
            ;;
        ?)
            echo "script usage: $(basename $0) [-v] [-h] [-f] [-p] [-t] [-T]" >&2
            exit 1
            ;;
   esac
done
shift "$(($OPTIND - 1))"

# echo "$remove_timeline , $clean_timeline , $path_dir"

if [[ $remove_timeline -lt $clean_timeline ]]; then
    echo "Error: value of -T must more than value of -t."
    exit 1
fi

if [[ $path_dir == "-1" ]]; then
    echo "Error: -p arg is required."
    exit 1
fi

echo "$remove_timeline , $clean_timeline , $path_dir"

# v4.4+
readarray -d '' files_half_year_ago < <(find $path_dir -iname "*.log*" -atime -$remove_timeline -atime +$clean_timeline -type f -print0);
readarray -d '' files_year_ago < <(find $path_dir -iname "*.log*" -atime -$remove_timeline -type f -print0);
# declare -p files_year_ago;

# v4.4-
# files_year_ago=()
# while IFS=  read -r -d $'\n'; do
#     files_year_ago+=("$REPLY")
# done < <(find $path_dir -iname "*.log*" -atime +$remove_timeline -type f)

# files_half_year_ago=()
# while IFS=  read -r -d $'\n'; do
#     files_half_year_ago+=("$REPLY")
# done < <(find $path_dir -iname "*.log*" -atime -$remove_timeline -atime +$clean_timeline -type f)


for filename in "${files_half_year_ago[@]}"; do
    file_handler "clean" $filename
done

for filename in "${files_year_ago[@]}"; do
    file_handler "delete" $filename
done
```
