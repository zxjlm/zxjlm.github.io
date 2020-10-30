---
layout: post
cid: 17
title: 图的生成和连通性判断实验
slug: 17
date: 2018/10/31 15:05:00
updated: 2018/10/31 15:06:15
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

## 这是 2018-10-31 的实验任务

描述：给定一个无向图，一共 n 个点，m 条边。请编写一个程序实现两种操作： D x y  从原图中删除连接 x，y 节点的边。 Q x y  询问 x，y 节点是否连通

### 输入

第一行两个数 n,m（5<=n<=40000,1<=m<=100000）

接下来 m 行，每行一对整数  x y （x,y<=n）,表示 x,y 之间有边相连。保证没有重复的边。

接下来一行一个整数  q（q<=100000）

以下 q 行每行一种操作，保证不会有非法删除。

### 输出

按询问次序输出所有 Q 操作的回答，连通的回答 C，不连通的回答 D

### 样例输入

    3 3 
    1 2 
    1 3 
    2 3 
    5 
    Q 1 2
    D 1 2 
    Q 1 2 
    D 3 2 
    Q 1 2

### 样例输出  

    C C D

## 解答

```c++
// MGraph.h
#ifndef MGraph_H
#define MGraph_H
const int MaxSize_point=40000;
const int MaxSize_arc=100000;

template <class DataType>
class MGraph
{
public:
    MGraph(int n,int e);
    ~MGraph();
	void visited_ur();
    void DFSTraverse(int v);
    void BFSTraverse(int v);
	int visited[MaxSize_point];
	void Delete(int a,int b);
	void Judge();
	void Question(int a,int b,int act_count);

private:
    DataType vertex[MaxSize_point];
    //int arc[MaxSize_point][MaxSize_point];
	int **arc;
    int vertexNum,arcNum;
	char action[MaxSize_arc];
};
#endif
```

```c++
// MGraph.h
#include <iostream>
using namespace std;
#include "MGraph.h"

template<class DataType>
MGraph<DataType>::MGraph(int n,int e)
{
    int i,j,k;
    vertexNum=n;arcNum=e;

	arc=new int *[vertexNum];
	for(int i=0;i<vertexNum;i++)
	{
		arc[i]=new int[vertexNum];
	}

    /*for( i = 0; i < vertexNum; i++)
    {
        vertex[i]=a[i];
    }*/

    for( i = 0; i < vertexNum; i++)
    {

        for( j = 0; j < vertexNum; j++)
        {
            arc[i][j]=0;
        }

    }


    for( k = 0; k < arcNum; k++)
    {
        //cout<<"请输入边的两个顶点的序号（序号从1开始计数）：";
        cin>>i>>j;
		i--;j--;
        arc[i][j]=1;arc[j][i]=1;
    }


}

template<class DataType>
void MGraph<DataType>::visited_ur()
{
	    for(int i = 0; i < MaxSize_point; i++)
    {
        visited[i]=0;
    }
}

template<class DataType>
void MGraph<DataType>::DFSTraverse(int v)
{
    //cout<<vertex[v];
	visited[v]=1;
    for(int j=0;j<vertexNum;j++)

        if (arc[v][j]==1&&visited[j]==0) {
            DFSTraverse(j);
        }

}

template<class DataType>
void MGraph<DataType>::BFSTraverse(int v)
{
    int Q[MaxSize_point];
    int front=-1,rear=-1;
    cout<<vertex[v];visited[v]=1;Q[++rear]=v;

    while(front!=rear){
        v=Q[++front];
        for (int j=0;j<vertexNum;j++)

            if (arc[v][j]==1&&visited[j]==0) {
                cout<<vertex[j];visited[j]=1;Q[++rear]=j;
            }

    }

}


template<class DataType>
void MGraph<DataType>::Delete(int a,int b)
{
	//a--;
	//b--;
	arc[a][b]=0;
	arc[b][a]=0;
}

template<class DataType>
void MGraph<DataType>::Question(int a,int b,int act_count)
{
	visited_ur();
	DFSTraverse(a);
	//	cout << " ";
	if(visited[b]==0)
		action[act_count]='D';
	else
		action[act_count]='C';
}

template<class DataType>
void MGraph<DataType>::Judge()
{
	int q;
	char Jud;
	int a,b;
	int act_count=0;
	//cout<<"操作数"<<endl;
	cin>>q;
	for(int i=0;i<q;i++)
	{
		//cout<<"指令："<<endl;
		cin>>Jud>>a>>b;
		a--;b--;
		if(Jud=='Q')
		{
			Question(a,b,act_count);
			act_count++;
		}
		else
			Delete(a,b);
	}
	for(int i=0;i<act_count;i++)
	{
		cout<<action[i]<<" ";
	}
	cout <<endl;
	//system("pause");
}

template<class DataType>
MGraph<DataType>::~MGraph()
{
	for(int i=0;i<vertexNum;i++)
	{
		delete [] arc[i];
	}
	delete arc;
}

```

```c++
// MGraph_main.cpp

#include<iostream>
using namespace std;
#include "MGraph.cpp"


int main(int argc, char const *argv[])
{
	int vertexNum,arcNum;
    //char ch[]={'A','B','C','D','E'};
	//char ch[]={'A','B','C','D'};
	//cout << "请输入节点数&bian："<<endl;
	cin >>vertexNum>> arcNum;

	MGraph<char> MG(vertexNum,arcNum);
	MG.Judge();
    //MGraph<char> MG(ch,4,4);
    //int i;
    /*cout<<"深度优先遍历序列是：";
	MG.visited_ur();
    for(i=0;i<vertexNum;i++)
	{
		if(MG.visited[i]==0)
		{
			MG.DFSTraverse(i);
			count++;
		}
		cout << " ";

	}
    cout <<endl;

    MG.visited_ur();
    cout << "广度优先遍历序列是：";
    for(i=0;i<vertexNum;i++)
	{
		if(MG.visited[i]==0)
		{
			MG.DFSTraverse(i);
		}
		cout << " ";
	}
    cout <<endl;

	if (count>1)
		cout<< "非连通图.连通分量有"<<count<<"个."<<endl;
	else
		cout<<"连通图."<<endl;*/

    system("pause");
    return 0;
}
```

## 更新记录

    /*18-10-24*/
    /*将visit加入类中，以避免使用全局变量*/
    /*通过循环判定visited实现非连通图遍历*/

    /*18-10-31*/
    /*基于任务要求进行修改，添加三个成员函数作为功能函数*/
