---
layout: post
cid: 27
title: c++实现字典（初步）
slug: 27
date: 2018/11/21 13:47:00
updated: 2019/07/20 22:13:35
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

这个字典程序算是最近学习 c++的一个成果集合了，就这样吧。（2018 年 11 月 21 日 13:47:00。）

```cpp
//
//  main.cpp
//  zidian
//
//  Created by Lion Heart on 2018/11/18.
//  Copyright © 2018 Lion. All rights reserved.
//

#include <iostream>
#include <map>
#include <string>
#include <fstream>
#include <time.h>
#include <Windows.h>
#include <iomanip>

using namespace std;

void cinfstr_cn();
void cinfstr_eng();
void test(int count);

map<string, string> temp_tran;
string temp_ENG[3000];
string temp_CN[3000];

class Dictionary
{
private:
    map<string, string> dic;
public:
    Dictionary(){};
    ~Dictionary(){};
    void insert_word();
    void Batch();          //temp
    void inquire();     //in_batch
    void sort();        //hang
    void display();
    void clear();

    void menu();
    void option1();
    void option2(int opt2);

};

void cinfstr_eng()
{
	char buffer[256];
	int count_word = 0;
	ifstream in("ENG.txt");
	if (!in.is_open())
	{
		cout << "Error opening file"; exit(1);
	}
	while (!in.eof())
	{
		in.getline(buffer, 100);
		temp_ENG[count_word] = buffer;
		count_word++;
	}

}

void cinfstr_cn()
{
	char buffer[256];
	int count_word = 0;
	ifstream in("ZH.txt");
	if (!in.is_open())
	{
		cout << "Error opening file"; exit(1);
	}
	while (!in.eof())
	{
		in.getline(buffer, 100);
		temp_CN[count_word] = buffer;
		//cout << buffer << endl;
		count_word++;
	}

}



int main(int argc, const char * argv[]) {
    // insert code here...
	cinfstr_cn();
	cinfstr_eng();

    Dictionary dic;

    string flag="y";
    while (flag=="y"||flag=="Y") {
        dic.menu();
        dic.option1();

        cout <<endl<< "Continue Operation(Y/N)"<<endl;
        cin>>flag;
		system("cls");
    }


	system("pause");
    return 0;
}


void Dictionary::menu()
{
    cout << "--------------------"<<endl;
    cout << "1.Creat:"<<endl;
    cout << "2.Inquire"<<endl;
    cout << "3.Sort"<<endl;
    cout << "4.Display"<<endl;
	cout << "------"<<endl;
	cout << "5.clear"<<endl;
    cout << "--------------------"<<endl;
    cout << "Please input your choice:"<<endl;
}

void Dictionary::option1()
{
    int opt1;
    cin >>opt1;
    int opt2;
    switch (opt1) {
        case 1:
			system("cls");                                  //aaaaaaaaaa
            cout << "1.One by one."<<endl;
            cout << "2.Batch generation."<<endl;
            cout << "3.Back step."<<endl;
			cout << "------------------------------"<<endl;
            cout << "Please input your choice:"<<endl;
            cin >>opt2;
			system("cls");                                  //aaaaaaaaaa
            option2(opt2);
            break;
        case 2:
            inquire();
            break;
        case 3:
            sort();
            break;
        case 4:
            display();
            break;
		case 5:
            clear();
            break;

        default:
            cout << "Wrong Input!"<<endl;
            break;
    }

}

void Dictionary::option2(int opt2)
{
    string flag_ina;
    switch (opt2) {
        case 1:
            do{
                insert_word();
                cout <<"Continue to input words?(Y/N)"<<endl;
                cin >> flag_ina;
            }while (flag_ina=="y"||flag_ina=="Y");
            break;
        case 2:
            Batch();
            break;
        case 3:
			//hahahahahahahahahahahahahahahahahahahahahahaha
            break;

        default:
            cout << "Wrong Input!"<<endl;
            break;
    }
}


void Dictionary::insert_word()
{
    string Eng,Zh_CN;
    cout << "Please input English:"<<endl;
    cin >> Eng;
    cout << "Please input paraphrase(Chinese):"<<endl;
    cin >>Zh_CN;
    dic.insert(make_pair(Eng, Zh_CN));
	system("cls");                                  //aaaaaaaaaa
}

void Dictionary::inquire()
{
    int opt;
    string a;
    cout << "Inquire by English or Chinese?"<<endl;
    cout << "1.English"<<endl;
    cout << "2.Chinese"<<endl;
    cin >>opt;
    if (opt ==1) {
        cout << "Plsase the word you want to inquire:"<<endl;
        cin >> a;
        if (dic.find(a)==dic.end()) {
            cout << a<<" is not in this dictionary~"<<endl;
        }
        else
        {
            cout << dic[a]<<endl;
        }
    }
    if (opt==2) {
        cout << "Plsase the word you want to inquire:"<<endl;
        cin >> a;
        bool flag=1;
		auto bba=dic.begin();
		while(bba!=dic.end())
        {
            if (bba->second==a) {
                cout << bba->first<<endl;
                flag=0;
                break;
            }
			++bba;
        }
        if (flag) {
            cout << a<<" is not in this dictionary~"<<endl;
        }
    }
    system("cls");                                  //aaaaaaaaaa
}

void Dictionary::sort()
{
	system("cls");
	test(4);
	Sleep(1000);
    //hang
}

void Dictionary::display()
{
	system("cls");
	cout << "--------------------------------------------------"<<endl;
    cout <<setiosflags(ios::left)<<setw(14)<< "English"<<resetiosflags(ios::left) << setiosflags(ios::left)<<setw(9)<<"Chinese"<<resetiosflags(ios::left)<<endl;
	//cout << dic["a"];
	auto bba=dic.begin();
	while(bba!=dic.end())
    {
        cout << setiosflags(ios::left)<<setw(14)<< bba->first<<resetiosflags(ios::left) << setiosflags(ios::left)<<setw(9)<<bba->second<<resetiosflags(ios::left)<<endl;
		++bba;
    }
}


void Dictionary::Batch()
{
    //hang
	int tim,n;

	cout <<"---------------------------------------------------"<<endl;
	cout << "Vocabulary will be imported from the file.\n";
	cout << "How many words do you want to add?(<=2999)" << endl;
	cin >> n;
	srand(time(NULL));
	for (int i = 0; i < n; i++)
	{
		tim = rand() % 2999;
		dic.insert(make_pair(temp_ENG[tim], temp_CN[tim]));
		//cout << dic[temp_ENG[tim]] << endl;
	}
	test(4);

}

void test(int count)
{
	cout << "[";
	for (int i=0;i<count;i++)
	{
		cout << "#";
		Sleep(500);
	}
	cout << "]";
	SetConsoleTextAttribute(GetStdHandle(STD_OUTPUT_HANDLE),FOREGROUND_GREEN);
	cout<<"		success"<<flush;
	SetConsoleTextAttribute(GetStdHandle(STD_OUTPUT_HANDLE),FOREGROUND_RED|FOREGROUND_GREEN|FOREGROUND_BLUE);
	cout <<"!"<<endl;

}

void Dictionary::clear()
{
	string flag;
	cout <<"----------------------------------------------------"<<endl;
	SetConsoleTextAttribute(GetStdHandle(STD_OUTPUT_HANDLE),FOREGROUND_RED);
	printf("Warnning!!!/n");
	cout << "You will delete all your data in this dic!"<<endl;
	cout << "Continnue? (Y/N)"<<endl;
	cin >>flag;

	if (flag=="y"||flag=="Y")
	{
		dic.erase(dic.begin(),dic.end());
	}
	else
	{
	}

}

/*
RIZHI
随机生成过程中出现重复可能缺失数据
*/
```
