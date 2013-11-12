# Copyright (c) 2013, Web Notes Technologies Pvt. Ltd.
# License: GNU General Public License v3. See license.txt

__author__ = "Maxwell Morais github.com/MaxMorais"

from __future__ import unicode_literals
import webnotes

def execute():
	doctemplate = {
		'doctype': 'Report Role',
		'parenttype': 'Role',
		'parentfield': 'roles'
	}
	reports = webnotes.conn.sql("SELECT name, ref_doctype FROM `tabReport`", as_dict=True);
	for report in reports:
		doclist = webnotes.bean("DocType", report['ref_doctype']).doclist
		roles = [doc.role for doc in doclist if doc.doctype=="DocPerm"]
		for role in roles:
			data = {'parent': report['name'], 'role': role}
			bean = webnotes.bean(copy=doctemplate)
			bean.fields.update(data)
			bean.insert()