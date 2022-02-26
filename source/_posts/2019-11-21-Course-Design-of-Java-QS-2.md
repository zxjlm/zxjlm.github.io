---
layout: post
cid: 167
title: Java课设中的问题以及解决方案(二)
slug: 167
date: 2019/11/21 19:15:40
updated: 2019/11/21 19:15:40
status: publish
author: harumonia
categories:
  - 源流清泉
  - Java
tags:
  - Java课程设计
customSummary:
noThumbInfoStyle: default
outdatedNotice: no
reprint: standard
thumb:
thumbChoice: default
thumbSmall:
thumbStyle: default
hidden: false
---

## windowbuilder 安装和使用

类比于在 VS stdio 上开发 c#,eclipse 有对应的 GUI 开发工具,也就是 windowbuilder.
当然同类型的工具也有 NetBeans 等.编程虽然有趣,但是本身是一件很麻烦的事情,所以我就只选择了普遍评价较高的 windowbuilder 作尝试.
[windowbuilder 主页](https://download.eclipse.org/windowbuilder/latest/)

S1:安装插件(install new software)(这里注意活用 help 功能)
S2:将 "https://download.eclipse.org/windowbuilder/latest/" 复制到 work with 一栏中
S3:一路点击 next 全选安装即可

安装完毕会提示重启,重启完成,在 new->other->windowbuilder->swing Designer->Application Window 中创建项目.

可以在代码文件的左下角发现,多了一个 Desgin 选项,至此,windowbuilder 安装完成.

## 多线程进阶

在[(一)](http://www.harumonia.top/index.php/archives/164/)中有提到的一个问题.
当时虽然成功创建了进度条,不过发现主窗体的线程钳制了分线程的运行(也就是说,主窗体线程运行完毕之前,分线程不会共享主线程的资源)

纠结了半个晚上,于是今天突发奇想,将分线程对主线程资源的操作转移到备胎线程之中,这样本质上大家都是分线程,也就不会出现次序问题了.

多说无益,上代码

```Java
button.addActionListener(new ActionListener() {
    public void actionPerformed(ActionEvent e) {
        new labelControl1(matrixLoder).start();
        new labelControl2(contentLoder).start();
        new labelControl3(probilityLoder).start();
        resultOf01Button.setEnabled(false);
        resultOfcontentButton.setEnabled(false);
        resultOfprobilityButton.setEnabled(false);
        chartsOfcontentButton.setEnabled(false);
        chartsOfProbilityButton.setEnabled(false);
        visable_init(true);

        new PostThread( file_load_res, inputString, arr, resultOf01Button, resultOfcontentButton, chartsOfcontentButton, chartsOfProbilityButton, resultOfprobilityButton).start();
    }
            //将post命令放在新的线程中并发执行
        });
```

### 效果图展示

![Kapture 2019-11-21 at 18.41.26.gif](https://i.loli.net/2019/11/21/IhHWwKyQV2z9eCS.gif)

## jtable 小结

在一种大概地提到过 JTable 这个组件.
本次的课程设计中,有非常多的表格需要展示,有的是从服务器接收到的 json 数据转 jtable,也有将本地的 csv 文件转化为 jtable,还有将 textarea 中的输入文本转化为 jtable,所以目前对于这个组件略有心得(笑

### jtable 的初始化

常用的三种初始化方式:

- JTable()
- JTable(int a,int b) //a 行 b 列
- JTable(Object a[][],Object b[]) //a 存放数据表,b 存放列名

一般我采用的是 new jtable(Object a[][],Object b[])这样的初始化方式.

#### json2jtable

```Java
JSONObject js = new JSONObject();
        js = JSON.parseObject(s1);


        HashSet<String> row =new HashSet<String>();
        List<String> cols = new ArrayList<>(js.keySet());
        List<String> rows = new ArrayList<>(js.getJSONObject(cols.get(0)).keySet());



        a = new Object[rows.size()][cols.size()];

        for (int i = 0; i < cols.size(); i++) {
    JSONObject eachcol = js.getJSONObject(cols.get(i));
    for (int j = 0; j < rows.size(); j++) {
//        System.out.println(eachcol.getString(rows.get(j)));
        a[j][i] = eachcol.getString(rows.get(j));
    }
        }

        tb = new JTable(a,cols.toArray());

        Container con = getContentPane();

        getContentPane().add(new JScrollPane(tb),BorderLayout.CENTER);

        tb.setAutoResizeMode(JTable.AUTO_RESIZE_OFF);

        setTitle(name);
        setSize(10000,10000);
        setVisible(true);
        validate();
        setDefaultCloseOperation(HIDE_ON_CLOSE);
```

#### csv2jtable

```Java
Object[] columnnames;
        CSVReader CSVFileReader = null;
        try {
    CSVFileReader = new CSVReader(new FileReader(filepath));
        } catch (FileNotFoundException e) {
    // TODO Auto-generated catch block
    e.printStackTrace();
        }
        List myEntries = null;
        try {
    myEntries = CSVFileReader.readAll();
        } catch (IOException | CsvException e) {
    // TODO Auto-generated catch block
    e.printStackTrace();
        }
        columnnames = (String[]) myEntries.get(0);
        DefaultTableModel tableModel = new DefaultTableModel(columnnames, myEntries.size()-1);
        int rowcount = tableModel.getRowCount();
        for (int x = 0; x<rowcount+1; x++)
        {
            int columnnumber = 0;
            // if x = 0 this is the first row...skip it... data used for columnnames
            if (x>0)
            {
                for (String thiscellvalue : (String[])myEntries.get(x))
                {
//                    System.out.println(thiscellvalue);
                    tableModel.setValueAt(thiscellvalue, x-1, columnnumber);
                    columnnumber++;
                }
            }
        }
        System.out.println(tableModel);
        return tableModel;
```

#### jtextarea2jtable

```Java
if (e.getDocument() == textPane.getDocument()) {
            Document doc = e.getDocument();
            String str = null;
            try {
        str = doc.getText(0, doc.getLength());
            } catch (BadLocationException e1) {
        // TODO Auto-generated catch block
        e1.printStackTrace();
            }
            arr = str.split("\\s+");

            if (arr.length %2 == 0) {
        Object [] columnnames = {"处方名","药名"};
        Object a[][];

        a = new Object[arr.length/2][2];

        for (int j = 0; j < arr.length; j++) {
            a[j/2][j%2] = arr[j];
        }

        table_1 = new JTable(a,columnnames);
        table_1.setBounds(86, 285, 678, 251);
        table_1.setEnabled(false);
        jContentPane.add(table_1);
        table_1.setAutoResizeMode(JTable.AUTO_RESIZE_OFF);
            }

        }
```

### 一些属性

Q:如何添加滚动条?
A:见[(一)](http://www.harumonia.top/index.php/archives/164/)

Q:表格想变为不可选?
A: JTable.setEnabled(false);

Q:表格变为只读?
A: 重载 JTable.isCellEditable(row, column), 令其始终返回 false.

## 监听设置

### 解决问题

监听 textarea 中输入的值,并在下方生成对应的数据表

### 解决方案

```Java
textPane.getDocument().addDocumentListener(new DocumentListener() {

    @Override
    public void removeUpdate(DocumentEvent e) {
        // TODO Auto-generated method stub

    }

    @Override
    public void insertUpdate(DocumentEvent e) {
        // TODO Auto-generated method stub
        if (e.getDocument() == textPane.getDocument()) {
            Document doc = e.getDocument();
            String str = null;
            try {
        str = doc.getText(0, doc.getLength());
            } catch (BadLocationException e1) {
        // TODO Auto-generated catch block
        e1.printStackTrace();
            }
            arr = str.split("\\s+");

            if (arr.length %2 == 0) {
        Object [] columnnames = {"处方名","药名"};
        Object a[][];

        a = new Object[arr.length/2][2];

        for (int j = 0; j < arr.length; j++) {
            a[j/2][j%2] = arr[j];
        }

        table_1 = new JTable(a,columnnames);
        table_1.setBounds(86, 285, 678, 251);
        table_1.setEnabled(false);
        jContentPane.add(table_1);
        table_1.setAutoResizeMode(JTable.AUTO_RESIZE_OFF);
            }

        }
    }

    @Override
    public void changedUpdate(DocumentEvent e) {
        // TODO Auto-generated method stub

    }
        });
```

### 补充说明

- removeUpdate 当删除发生时
- insertUpdate 当插入发生时
- changedUpdate 当发生变化时

处于性能考虑,一般选择只使用 insert

**这里涉及到一个问题,就是正则化是在监听时完成还是在上传时完成.**

处于性能考虑,我选择再上传时统一进行正则化.

![Kapture 2019-11-21 at 18.57.08.gif](https://i.loli.net/2019/11/21/PGYbzCSKhE3yLrQ.gif)

## 后记

> 就这样，看似徒劳的事，最终却结出了果实，一件失败的事情会变成对人类的大声疾呼，要求人类将精力集中到还未完成的事业当中去；在卓越的对抗中，壮烈的死亡可以生出新的生命，一次毁灭也可以生出攀登高峰的奋起意志。因为在偶然的成就和轻易获得的成功中，只有雄心壮志才能点燃火热的心，一个人虽然在与不可战胜的、占据优势的命运的斗争中毁灭了自己，但他的心灵却变得无比高尚。这些在所有时代都最最伟大的悲剧，作家可能只会偶尔创作，但现实生活却早已将其演绎了千百遍。

-- 茨威格<人类群星闪耀时>
