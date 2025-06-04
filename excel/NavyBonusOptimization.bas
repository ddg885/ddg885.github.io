Option Explicit

' Data structure to hold rating information
' Holds data for a single rating
Type RatingInfo
    Rating As String
    Inventory As Long
    Requirement As Long
    Category As String   ' NAT, PS or BOTH
    PctNAT As Double
    RetentionAvg As Double
    Need As Long
    NeedNAT As Long
    NeedPS As Long
    Manning As Double
    ' Separate fields for NAT and PS bonus assignments
    NATTier As String
    NATBonus As Double
    PSTier As String
    PSBonus As Double
End Type

Sub OptimizeBonuses()
    Dim wsInv As Worksheet
    Dim wsTier As Worksheet
    Dim wsBudget As Worksheet
    Dim wsOut As Worksheet
    Dim wsThresh As Worksheet

    ' Validate required worksheets exist to avoid runtime errors
    On Error GoTo MissingSheet
    Set wsInv = Sheets("Inventory")
    Set wsTier = Sheets("Tier Mapping")
    Set wsBudget = Sheets("Budget")
    Set wsOut = Sheets("Raw Output")
    Set wsThresh = Sheets("Optimal Tier")
    On Error GoTo 0

    Dim lastInv As Long, lastTier As Long
    lastInv = wsInv.Cells(wsInv.Rows.Count, "A").End(xlUp).Row
    lastTier = wsTier.Cells(wsTier.Rows.Count, "A").End(xlUp).Row

    Dim ratings() As RatingInfo
    Dim i As Long, idx As Long
    ReDim ratings(1 To lastInv - 1)

    ' Read inventory data
    idx = 1
    For i = 2 To lastInv
        ratings(idx).Rating = Trim(wsInv.Cells(i, 1).Value)
        ratings(idx).Inventory = CLng(wsInv.Cells(i, 2).Value)
        ratings(idx).Requirement = CLng(wsInv.Cells(i, 3).Value)
        ratings(idx).Category = UCase(Trim(wsInv.Cells(i, 4).Value))

        Dim pctVal As Variant
        pctVal = wsInv.Cells(i, 5).Value
        If IsNumeric(pctVal) Then
            ratings(idx).PctNAT = pctVal
        Else
            ratings(idx).PctNAT = 0
        End If

        ratings(idx).RetentionAvg = Application.Average(wsInv.Cells(i, 6).Resize(1, 5))

        Dim estRetained As Double
        estRetained = ratings(idx).Inventory * ratings(idx).RetentionAvg
        ratings(idx).Need = Application.Max(0, ratings(idx).Requirement - estRetained)
        ratings(idx).NeedNAT = CLng(ratings(idx).Need * ratings(idx).PctNAT)
        ratings(idx).NeedPS = CLng(ratings(idx).Need - ratings(idx).NeedNAT)

        If ratings(idx).Requirement > 0 Then
            ratings(idx).Manning = ratings(idx).Inventory / ratings(idx).Requirement
        Else
            ratings(idx).Manning = 0
        End If

        idx = idx + 1
    Next i
    Dim ratingCount As Long
    ratingCount = idx - 1

    ' Read tier mapping into arrays sorted by bonus (highest first)
    Dim tiersNAT As Variant, tiersPS As Variant
    tiersNAT = ReadTiers(wsTier, "NAT")
    tiersPS = ReadTiers(wsTier, "PS")

    ' Sort ratings by manning
    Dim j As Long
    For i = 1 To ratingCount - 1
        For j = i + 1 To ratingCount
            If ratings(j).Manning < ratings(i).Manning Then
                Dim temp As RatingInfo
                temp = ratings(i)
                ratings(i) = ratings(j)
                ratings(j) = temp
            End If
        Next j
    Next i

    ' Budgets
    Dim budNAT As Double, budPS As Double
    budNAT = wsBudget.Range("B2").Value
    budPS = wsBudget.Range("C2").Value

    ' Assign tiers for NAT and PS needs
    Dim cat As String
    For i = 1 To ratingCount
        cat = ratings(i).Category
        If cat = "NAT" Or cat = "BOTH" Then
            AssignTier ratings(i), tiersNAT, budNAT, True
        End If
        If cat = "PS" Or cat = "BOTH" Then
            AssignTier ratings(i), tiersPS, budPS, False
        End If
    Next i

    ' Output results
    OutputRatings wsOut, ratings, ratingCount
    OutputThresholds wsThresh, tiersNAT, tiersPS
    Exit Sub

MissingSheet:
    MsgBox "One or more required worksheets are missing.", vbCritical
End Sub

Private Sub AssignTier(ByRef r As RatingInfo, tiers As Variant, ByRef budget As Double, Optional isNAT As Boolean = True)
    Dim qty As Long
    If isNAT Then
        qty = r.NeedNAT
    Else
        qty = r.NeedPS
    End If
    If qty <= 0 Then Exit Sub

    Dim k As Long
    For k = LBound(tiers, 1) To UBound(tiers, 1)
        Dim initPay As Double
        initPay = qty * 0.5 * tiers(k, 2)
        If initPay <= budget Then
            If isNAT Then
                r.NATTier = tiers(k, 1)
                r.NATBonus = tiers(k, 2)
            Else
                r.PSTier = tiers(k, 1)
                r.PSBonus = tiers(k, 2)
            End If
            budget = budget - initPay
            Exit For
        End If
    Next k
End Sub

Private Sub OutputRatings(ws As Worksheet, ratings() As RatingInfo, count As Long)
    ws.Cells.Clear
    ws.Range("A1:G1").Value = Array("Rating", "Category", "Tier", "Need", "Bonus", "Yr1 Initial", "Anniversary")
    ws.Range("H1:M1").Value = Array("Yr1", "Yr2", "Yr3", "Yr4", "Yr5", "Yr6")

    Dim i As Long, row As Long
    row = 2
    For i = 1 To count
        ' NAT row
        If ratings(i).NeedNAT > 0 And ratings(i).NATTier <> "" Then
            WriteOutputRow ws, row, ratings(i).Rating, "NAT", ratings(i).NATTier, ratings(i).NeedNAT, ratings(i).NATBonus, True
            row = row + 1
        End If

        ' PS row
        If ratings(i).NeedPS > 0 And ratings(i).PSTier <> "" Then
            WriteOutputRow ws, row, ratings(i).Rating, "PS", ratings(i).PSTier, ratings(i).NeedPS, ratings(i).PSBonus, False
            row = row + 1
        End If
    Next i
End Sub

Private Sub WriteOutputRow(ws As Worksheet, row As Long, rating As String, _
                            cat As String, tier As String, qty As Long, _
                            bonus As Double, isNAT As Boolean)
    ws.Cells(row, 1).Value = rating
    ws.Cells(row, 2).Value = cat
    ws.Cells(row, 3).Value = tier
    ws.Cells(row, 4).Value = qty
    ws.Cells(row, 5).Value = bonus
    ws.Cells(row, 6).Value = qty * bonus * 0.5
    If isNAT Then
        ws.Cells(row, 7).Value = qty * bonus * 0.5 / 5
    Else
        ws.Cells(row, 7).Value = qty * bonus * 0.5 / 2
    End If
    Dim y As Long
    For y = 1 To 6
        Select Case y
            Case 1
                ws.Cells(row, 7 + y).Value = qty * bonus * 0.5
            Case Else
                If isNAT And y <= 6 Then
                    ws.Cells(row, 7 + y).Value = qty * bonus * 0.5 / 5
                ElseIf Not isNAT And y <= 3 Then
                    ws.Cells(row, 7 + y).Value = qty * bonus * 0.5 / 2
                Else
                    ws.Cells(row, 7 + y).Value = 0
                End If
        End Select
    Next y
End Sub

Private Sub OutputThresholds(ws As Worksheet, tiersNAT As Variant, tiersPS As Variant)
    ws.Cells.Clear
    ws.Range("A1:D1").Value = Array("Category", "Tier", "Min Manning", "Max Manning")
    Dim i As Long
    For i = LBound(tiersNAT, 1) To UBound(tiersNAT, 1)
        ws.Cells(i + 1, 1).Value = "NAT"
        ws.Cells(i + 1, 2).Value = tiersNAT(i, 1)
    Next i
    Dim offset As Long
    offset = UBound(tiersNAT, 1) + 2
    For i = LBound(tiersPS, 1) To UBound(tiersPS, 1)
        ws.Cells(offset + i, 1).Value = "PS"
        ws.Cells(offset + i, 2).Value = tiersPS(i, 1)
    Next i
End Sub

' Read tier mapping for a given category and sort descending by bonus
Private Function ReadTiers(ws As Worksheet, cat As String) As Variant
    Dim lastRow As Long
    lastRow = ws.Cells(ws.Rows.Count, "A").End(xlUp).Row

    If lastRow < 2 Then
        ReadTiers = Array()
        Exit Function
    End If

    Dim temp() As Variant
    ReDim temp(1 To lastRow - 1, 1 To 2)
    Dim count As Long
    count = 0

    Dim i As Long
    For i = 2 To lastRow
        If UCase(ws.Cells(i, 1).Value) = UCase(cat) Then
            count = count + 1
            temp(count, 1) = ws.Cells(i, 2).Value
            temp(count, 2) = ws.Cells(i, 3).Value
        End If
    Next i

    If count = 0 Then
        ReadTiers = Array()
        Exit Function
    End If

    Dim result() As Variant
    ReDim result(1 To count, 1 To 2)
    Dim idx As Long
    For idx = 1 To count
        result(idx, 1) = temp(idx, 1)
        result(idx, 2) = temp(idx, 2)
    Next idx

    ' simple bubble sort by bonus descending
    Dim j As Long
    Dim swapped As Boolean
    Do
        swapped = False
        For i = 1 To count - 1
            If result(i, 2) < result(i + 1, 2) Then
                Dim tmp1 As Variant, tmp2 As Variant
                tmp1 = result(i, 1): tmp2 = result(i, 2)
                result(i, 1) = result(i + 1, 1): result(i, 2) = result(i + 1, 2)
                result(i + 1, 1) = tmp1: result(i + 1, 2) = tmp2
                swapped = True
            End If
        Next i
    Loop While swapped

    ReadTiers = result
End Function
