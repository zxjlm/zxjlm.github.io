---
layout: post
cid: 29
title: 鬼畜的回形数
slug: 29
date: 2018/12/02 18:48:11
updated: 2018/12/02 18:48:11
status: publish
author: harumonia
categories:
  - 源流清泉
  - 数据结构
  - c++
tags:
  - 算法
thumb:
thumbStyle: default
hidden: false
---

```cpp
#include <iostream>


using namespace std;

int judge(int n,int m)
{
    if (n%2==0) {
        return n/2+1;
    }
    else{
        return n/2;
    }
}

int main()
{
    int q[200][200];
    int n,m;
    cin >> n>>m;
    /*int **q;
    q=new int*[n];
    for (int i=0; i<n; i++) {
        q[i]=new int[m];
    }*/
    for (int i=0; i<n; i++) {
        for (int j=0; j<m; j++) {
            cin>>q[i][j];
        }
    }
    //cout << q[0][0]<<endl;

    int right=m-1,left=0,up=0,down=n-1;
    while (1){
        for (int i=up; i<=down; i++) {
            cout << q[i][left]<<" ";
        }
        left++;
        for (int i=left; i<=right; i++) {
            cout << q[down][i]<<" ";
        }
        down--;
        if (right+1==left||up==down+1) {
            break;
        }
        for (int i=down; i>=up; i--) {
            cout << q[i][right]<<" ";
        }
        right--;
        for (int i=right; i>=left; i--) {
            cout << q[up][i]<<" ";
        }
        up++;
        if (right+1==left||up==down+1) {
            break;
        }
       // cout <<endl<< up<<" "<<left<<endl;
        //cout << m/2+2 << " "<<n/2+2<<endl;
    }
    cout <<endl;



    return 0;
}



```
