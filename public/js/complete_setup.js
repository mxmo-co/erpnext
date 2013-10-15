// Copyright (c) 2013, Web Notes Technologies Pvt. Ltd.
// License: GNU General Public License v3. See license.txt

// complete my company registration
// --------------------------------
wn.provide('erpnext.complete_setup');

$.extend(erpnext.complete_setup, {
	show: function() {
		d = erpnext.complete_setup.prepare_dialog();
		d.show();
	},
	
	prepare_dialog: function() {	
		var d = new wn.ui.Dialog({
			title: "Setup",
			fields: [
				{fieldname:'first_name', label:wn._('Your First Name'), fieldtype:'Data', reqd: 1},
				{fieldname:'last_name', label: wn._('Your Last Name'), fieldtype:'Data'},
				{fieldname:'company_name', label:wn._('Company Name'), fieldtype:'Data', reqd:1,
					description: wn._('e.g. "My Company LLC"')},
				{fieldname:'company_abbr', label:wn._('Company Abbreviation'), fieldtype:'Data',
					description:wn._('e.g. "MC"'),reqd:1},
				{fieldname:'fy_start', label:wn._('Financial Year Start Date'), fieldtype:'Select',
					description:wn._('Your financial year begins on"'), reqd:1,
					options: erpnext.complete_setup.fy_start_list.join('\n')},
				{fieldname:'country', label: wn._('Country'), reqd:1,
					options: "", fieldtype: 'Select'},
				{fieldname:'currency', label: wn._('Default Currency'), reqd:1,
					options: "", fieldtype: 'Select'},
				{fieldname:'timezone', label: wn._('Time Zone'), reqd:1,
					options: "", fieldtype: 'Select'},
				{fieldname:'industry', label: wn._('Industry'), reqd:1,
					options: erpnext.complete_setup.domains.join('\n'), fieldtype: 'Select'},
				{fieldname:'update', label:wn._('Setup'),fieldtype:'Button'},
			],
		});
		
		if(user != 'Administrator'){
			d.$wrapper.find('.close').toggle(false); // Hide close image
			$('header').toggle(false); // hide toolbar
		}
		
		wn.call({
			method:"webnotes.country_info.get_country_timezone_info",
			callback: function(data) {
				erpnext.country_info = data.message.country_info;
				erpnext.all_timezones = data.message.all_timezones;
				d.get_input("country").empty()
					.add_options([""].concat(keys(erpnext.country_info).sort()));
				d.get_input("currency").empty()
					.add_options(wn.utils.unique([""].concat($.map(erpnext.country_info, 
						function(opts, country) { return opts.currency; }))).sort());
				d.get_input("timezone").empty()
					.add_options([""].concat(erpnext.all_timezones));
			}
		})
		
		// on clicking update
		d.fields_dict.update.input.onclick = function() {
			var data = d.get_values();
			if(!data) return;
			$(this).set_working();
			return $c_obj('Setup Control','setup_account',data,function(r, rt){
				$(this).done_working();
				if(!r.exc) {
					sys_defaults = r.message;
					user_fullname = r.message.user_fullname;
					wn.boot.user_info[user].fullname = user_fullname;
					d.hide();
					$('header').toggle(true);
					wn.container.wntoolbar.set_user_name();
					
					setTimeout(function() { window.location.reload(); }, 3000);
				}
			});
		};

		d.fields_dict.company_name.input.onchange = function() {
			var parts = d.get_input("company_name").val().split(" ");
			var abbr = $.map(parts, function(p) { return p ? p.substr(0,1) : null }).join("");
			d.get_input("company_abbr").val(abbr.toUpperCase());
		}

		d.fields_dict.country.input.onchange = function() {
			var country = d.fields_dict.country.input.value;
			var $timezone = $(d.fields_dict.timezone.input);
			$timezone.empty();
			// add country specific timezones first
			if(country){
				var timezone_list = erpnext.country_info[country].timezones || [];
				$timezone.add_options(timezone_list.sort());
				
				d.get_input("currency").val(erpnext.country_info[country].currency);
			}
			// add all timezones at the end, so that user has the option to change it to any timezone
			$timezone.add_options([""].concat(erpnext.all_timezones));
			
		};
		
		// company name already set
		if(wn.control_panel.company_name) {
			var inp = d.fields_dict.company_name.input;
			inp.value = wn.control_panel.company_name;
			inp.disabled = true;
			d.fields_dict.company_name.$input.trigger("change");
		}

		// set first name, last name
		if(user_fullname) {
			u = user_fullname.split(' ');
			if(u[0]) {
				d.fields_dict.first_name.input.value = u[0];
			}
			if(u[1]) {
				d.fields_dict.last_name.input.value = u[1];			
			}
		}
		
		return d;
	},
	
	fy_start_list: ['', '1st Jan', '1st Apr', '1st Jul', '1st Oct'],

	domains: ['', "Manufacturing", "Retail", "Distribution", "Services", "Other"],	
});