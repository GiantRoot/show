---
slug: distance-two-segments
title: 线段之间的距离
authors: [pevoro]
tags: [share]
---

计算点和线段之间的距离，线段和线段之间的距离

## 空间中点和线段之间的距离

已知点 $P_0$ ，线段 $\overrightarrow{P_1P_2}$，
假设线段 $\overrightarrow{P_1P_2}$ 延长线上距离 $P_0$ 最近的点是 $P$，
设P点坐标为

$$P=P_1+u(P_2-P_1)$$ 

$u$ 是位置标量。


由于 $P_0$ 点到 $P$ 点是 $P_0$ 到线段 $\overrightarrow{P_1P_2}$ 延长线上距离最近的点，
所以 $\overrightarrow{PP_0}$ 垂直于 $\overrightarrow{P_1P_2}$。

将 $P=P_1+u(P_2-P_1)$ 带入 

$$(P_0-P)\cdot(P_2-P_1)=0$$ 

得

$$(P_0-P_1-u(P_2-P_1))\cdot(P_2-P_1)=0$$

从而

$$u=\frac{(P_0-P_1)\cdot(P_2-P_1)}{||P_2-P_1||^2}$$


如果 $u \lt=0 $，且$P_1$为端点，则最小距离为$||P_1-P_0||$


如果 $u \gt=1$，且$P_2$为端点，则最小距离为$||P_2-P_0||$


如果没有端点，则最小距离为，$||P-P_0||$

## 空间线段和线段之间的最短距离

已知线段 $\overrightarrow{P_1P_2}$ 和线段 $\overrightarrow{P_3P_4}$，
假设直线 $\overline{P_1P_2}$ 和直线 $\overline{P_3P_4}$ 之间的最短连线为 $\overrightarrow{P_aP_b}$，
设 $P_a$ 和 $P_b$ 点坐标为：

$$P_a=P_1+u_a(P_2-P_1)$$ 

$$P_b=P_3+u_b(P_4-P_3)$$

$u_a$和$u_b$是位置标量。

由于直线$\overline{P_1P_2}$和直线$\overline{P_3P_4}$之间的最短连线为$\overrightarrow{P_aP_b}$，则
$$\overrightarrow{P_aP_b}\perp\overrightarrow{P_1P_2}$$

$$\overrightarrow{P_aP_b}\perp\overrightarrow{P_3P_4}$$

于是

$$(P_b-P_a)\cdot(P_2-P_1)=0$$

$$(P_b-P_a)\cdot(P_4-P_3)=0$$

即

$$(P_3+u_b(P_4-P_3)-(P_1+u_a(P_2-P_1)))\cdot(P_2-P_1)=0$$

$$(P_3+u_b(P_4-P_3)-(P_1+u_a(P_2-P_1)))\cdot(P_4-P_3)=0$$

从上面两个式子分别得到

$$u_a=\frac{(P_3-P_1)\cdot(P_2-P_1)+u_b(P_4-P_3)\cdot(P_2-P_1)}{||P_2-P_1||^2}$$

$$u_b=\frac{u_a(P_2-P_1)\cdot(P_4-P_3)-(P_3-P_1)\cdot(P_4-P_3)}{||P_4-P_3||^2}$$

设

$$k_1=(P_3-P_1)\cdot(P_2-P_1)$$

$$k_2=(P_4-P_3)\cdot(P_2-P_1)=(P_2-P_1)\cdot(P_4-P_3)$$

$$k_3=||P_2-P_1||^2$$

$$k_4=(P_3-P_1)\cdot(P_4-P_3)$$

$$k_5=||P_4-P_3||^2$$

带入得到

$$u_a=\frac{k_1 + u_b k_2}{k_3}$$

$$u_b=\frac{u_a k_2-k_4}{k_5}$$

将$u_a$带入$u_b$得到

$$u_b=\frac{\frac{k_1+u_b k_2}{k_3} k_2-k_4}{k_5}=\frac{k_1 k_2+u_b k_2^2-k_3 k_4}{k_3 k_5}$$

求得

$$u_b=\frac{\frac{k_1 k_2-k_3 k_4}{k_3 k_5}}{1-\frac{k_2^2}{k_3 k_5}}=\frac{k_1 k_2-k_3 k_4}{k_3 k_5 - k_2^2}$$

将$u_b$带入到$u_a$的表达式，就可以得到$u_a$

从而得到$P_a$和 $P_b$

最短距离就是$$||P_b-P_a||$$

### 当最近的点在线段上时

上面的计算是正确的，如果最近点不在线段上，则需要考虑line1和line2是不是直线或者射线

先假设，$P_a=P_1,P_b=P_3$,则最小距离$Dis=||P_b-P_a||$

当$P_1$是端点，且$u_a\lt0$时，

计算P_1和$\overrightarrow{P_3P_4}$的最短距离$Dis_T$，最近点为$P_T$，
如果$$Dis_T \lt Dis$$则
$$Dis = Dis_T$$

$$P_a = P_1$$

$$P_b = P_T$$


当$P_2$是端点，且$u_a\gt1$时，

计算P_2和$\overrightarrow{P_3P_4}$的最短距离$Dis_T$，最近点为$P_T$，如果$$Dis_T \lt Dis$$则

$$Dis = Dis_T$$ 

$$P_a = P_2$$

$$P_b = P_T$$

当$P_3$是端点，且$u_b\lt0$时，

计算P_3和$\overrightarrow{P_1P_2}$的最短距离$Dis_T$，最近点为$P_T$，如果$$Dis_T \lt Dis$$则

$$Dis = Dis_T$$ 

$$P_b = P_3$$ 

$$P_a = P_T$$


当$P_4$是端点，且$u_b\gt1$时，

计算P_4和$\overrightarrow{P_1P_2}$的最短距离$Dis_T$，最近点为$P_T$，如果$$Dis_T \lt Dis$$则

$$Dis = Dis_T$$

$$P_b = P_4$$

$$P_a = P_T$$

以上是在两条直线不平行和不重叠的情况下进行的

### 当两条直线平行或者共线时

如果两条直线平行或者共线，则需要进行特殊讨论

1. $\overrightarrow{P_3P_4}$在$\overline{P_1P_2}$的后侧，且$P_4$和$P_1$较近，
   即$(P_3-P_1)\cdot(P_2-P_1)\lt=(P_4-P_1)\cdot(P_2-P_1)\lt=0$，如果$P_4$和$P_1$为端点，则

   $$P_a=P_1$$

   $$P_b=P_4$$


2. $\overrightarrow{P_3P_4}$在$\overline{P_1P_2}$的后侧，且$P_3$和$P_1$较近，即$(P_4-P_1)\cdot(P_2-P_1)\lt=(P_3-P_1)\cdot(P_2-P_1)\lt=0$，如果$P_3$和$P_1$为端点，则

   $$P_a=P_1$$
   
   $$P_b=P_3$$


3. $\overrightarrow{P_3P_4}$在$\overline{P_1P_2}$的前侧，且$P_3$和$P_2$较近，即$0\lt=(P_3-P_2)\cdot(P_2-P_1)\lt=(P_4-P_2)\cdot(P_2-P_1)$，如果$P_3$和$P_2$为端点，则

   $$P_a=P_2$$
   
   $$P_b=P_3$$


4. $\overrightarrow{P_3P_4}$在$\overline{P_1P_2}$的前侧，且$P_4$和$P_2$较近，即$0\lt=(P_4-P_2)\cdot(P_2-P_1)\lt=(P_3-P_2)\cdot(P_2-P_1)$，如果$P_4$和$P_2$为端点，则
   $$P_a=P_2$$
   
   $$P_b=P_4$$
   

    以上四种情况的距离为

    $$Dis = ||P_b-Pa||$$

5. 如果上述四种情况均不符合，则说明有无数多最近点


    $$Dis = ||\frac{(P_3-P_1)\otimes(P_2-P_1)}{||P_2-P_1||}||$$


## Python代码实现

```python
import numpy as np

class distance():
    def __init__(self):
        return

    def points(point1, point2):
        '''
        Calculate distance between two points or
        minimum distance between two point sets
        '''
        # First adjust points coordinates data shape
        # point date type is like: np.array([[x1,y1,z1],[x2,y2,z2],...)
        # Caution: double '['in point1 and point2
        point1 = np.array(point1).reshape(-1, 3)
        point2 = np.array(point2).reshape(-1, 3)
        if point1.shape[0]*point2.shape[0] == 0:  # 如果两个数组中有一个为空
            # print("at least one points set in pointsDistance is void")
            return 0
        nrows, ncols = point1.shape
        dtype = {'names': ['f{}'.format(i) for i in range(ncols)],
                 'formats': ncols * [point1.dtype]}
        inter12 = np.intersect1d(point1.view(dtype), point2.view(dtype))
        if inter12.shape[0] != 0:
            # print("Intersected")
            return 0
        disArray = np.array([])
        for pointa in point1:
            for pointb in point2:
                disArray = np.append(disArray, np.linalg.norm(pointa-pointb))
        disArray = np.sort(np.unique(disArray))
        return disArray

    def pointLine(point, line, end1=1, end2=2, dimension=3):
        '''
        pointLine(point,line,end1=0,end2=0)
        point: the point coordinate [x0,y0,z0] or for 2D: [x0,y0]
        line:  two points on line. p1 and p2.[x1,y1,z1,x2,y2,z2]
            for 2D:[[x1,y1,x2,y2]]
        end1: if end1=1, then p1 is one end of the line segment
            if end1=0, then p1 is not end of the line segment
        end2: the other end of line segment
        '''
        p0 = np.array(point).reshape(-1, dimension)[0]
        # np.array([[[x0,y0,z0]]]) only one point
        p1 = np.array(line).reshape(-1, dimension)[0]
        p2 = np.array(line).reshape(-1, dimension)[1]
        # np.array([[[x1,y1,z1],[x2,y2,z2]]]) only two points
        u = (p0-p1).dot(p2-p1)/np.linalg.norm(p2-p1)**2.
        if end1 == 1 and u <= 0:
            p = p1
            distance = np.linalg.norm(p-p0)
        elif end2 == 1 and u >= 1:
            p = p2
            distance = np.linalg.norm(p-p0)
        else:
            p = p1 + u*(p2-p1)
            distance = np.linalg.norm(p - p0)
        return p, distance

    def lines(line1, line2, end1=1, end2=1, end3=1, end4=1, dimension=3):
        '''
        Calculate the distance between two line segments
        Reference：
        http://paulbourke.net/geometry/pointlineplane/
        https://stackoverflow.com/questions/2824478/shortest-distance-between-two-line-segments
        '''
        ''' Given two lines segments defined by numpy.array
        line:  two points on line. p1 and p2.[x1,y1,z1,x2,y2,z2]
                for 2D:[[x1,y1,x2,y2]]
            There are four points for these two lines
        end1: if end1=1, then p1 is one end of the line1 segment.
            if end1=0, then p1 is not end of the line1 segment.
        end2: the other end of line1 segment.
        end3 and end4: ends of line2 segment.
        '''
        p1 = np.array(line1).reshape(-1, dimension)[0]
        p2 = np.array(line1).reshape(-1, dimension)[1]
        # np.array([[[x1,y1,z1],[x2,y2,z2]]]) two points for first line
        p3 = np.array(line2).reshape(-1, dimension)[0]
        p4 = np.array(line2).reshape(-1, dimension)[1]
        # np.array([[[x3,y3,z3],[x4,y4,z4]]]) two points for second line
        # 先判断是不是平行和共线
        line1 = p2 - p1
        line2 = p4 - p3
        line1Norm = np.linalg.norm(line1)
        line12cross = np.cross(line1, line2)
        line12crossNorm = np.linalg.norm(line12cross)
        if line12crossNorm != 0:    # 不平行且不共线
            # calculate mid variables
            k1 = (p3-p1).dot(line1)
            k2 = (line2).dot(line1)
            k3 = np.linalg.norm(line1)**2.
            k4 = (p3-p1).dot(line2)
            k5 = np.linalg.norm(line2)**2.
            ub = (k1 * k2 - k3 * k4)/(k3 * k5 - k2**2.)
            ua = (k1 + ub*k2)/k3
            pa = p1 + ua*(line1)
            pb = p3 + ub*(line2)
            if 0 <= ua <= 1 and 0 <= ub <= 1:  # 当最近点都在线段上时
                distance = np.linalg.norm(pb-pa)
                return pa, pb, distance
            # print("ua,ub,pa,pb:", ua, ub, pa, pb)
            # 两个直线最近点不在线段上
            pa = p1
            pb = p3
            distance = np.linalg.norm(pb-pa)  # 假设最近距离为p3-p1之间的距离
            if end1 == 1 and ua <= 0:
                pT, distanceT = pointLine(
                    p1,
                    [p3, p4],
                    end1=end3,
                    end2=end4,
                    dimension=dimension)
                if distanceT <= distance:
                    distance = distanceT
                    pa = p1
                    pb = pT
            if end2 == 1 and ua >= 1:
                pT, distanceT = pointLine(
                    p2,
                    [p3, p4],
                    end1=end3,
                    end2=end4,
                    dimension=dimension)
                if distanceT <= distance:
                    distance = distanceT
                    pa = p2
                    pb = pT
            if end3 == 1 and ub <= 0:
                pT, distanceT = pointLine(
                    p3,
                    [p1, p2],
                    end1=end1,
                    end2=end2,
                    dimension=dimension)
                if distanceT <= distance:
                    distance = distanceT
                    pa = pT
                    pb = p3
            if end4 == 1 and ub >= 1:
                pT, distanceT = pointLine(
                    p4,
                    [p1, p2],
                    end1=end1,
                    end2=end2,
                    dimension=dimension)
                if distanceT <= distance:
                    distance = distanceT
                    pa = pT
                    pb = p4
        else:
            # print("平行或者共线")
            if ((p3-p1).dot(line1) <= (p4-p1).dot(line1) <= 0 and
                    end4 == 1 and end1 == 1):  # line2 在line1后侧且p4距离p1近
                # print("#line2 在line1后侧且p4距离p1近")
                pa = p1
                pb = p4
                distance = np.linalg.norm(pb-pa)
            elif ((p4-p1).dot(line1) <= (p3-p1).dot(line1) <= 0 and
                  end3 == 1 and end1 == 1):  # line2 在line1后侧且p3距离p1近
                # print("#line2 在line1后侧且p3距离p1近")
                pa = p1
                pb = p3
                distance = np.linalg.norm(pb-pa)
            elif (0 <= (p3-p2).dot(line1) <= (p4-p2).dot(line1) and
                  end3 == 1 and end2 == 1):  # line2 在line1前侧且p3距离p2近
                # print("#line2 在line1前侧且p3距离p2近")
                pa = p2
                pb = p3
                distance = np.linalg.norm(pb-pa)
            elif (0 <= (p4-p2).dot(line1) <= (p3-p2).dot(line1) and
                  end4 == 1 and end2 == 1):  # line2 在line1前侧且p4距离p2近
                # print("#line2 在line1前侧且p4距离p2近")
                pa = p2
                pb = p4
                distance = np.linalg.norm(pb-pa)
            else:
                # print("无穷多最近点")
                pa = None
                pb = None
                distance = np.linalg.norm(np.cross((p3-p1), line1)/line1Norm)
        # print("pa,pb,distance:", pa, pb, distance)
        return pa, pb, distance
```